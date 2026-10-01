const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../../backend');
const candidate2 = path.resolve(__dirname, '../../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const attendanceRepository = require(path.join(backendRoot, 'src/repositories/attendance.repository'));
const shiftRepository = require(path.join(backendRoot, 'src/repositories/shift.repository'));
const databaseRepository = require(path.join(backendRoot, 'src/repositories/database.repository'));
const auditLogRepository = require(path.join(backendRoot, 'src/repositories/auditLog.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));

// Mock defaults
auditLogRepository.create = async () => ({});
databaseRepository.isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
databaseRepository.transaction = async (work) => work({});

// Import target unit: attendanceService
const attendanceService = require(path.join(backendRoot, 'src/services/attendanceService'));

function createMockEmployee(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439020',
    employeeCode: 'NV0001',
    fullName: 'Trần Văn Nam',
    lastAttendanceAt: null,
    isActive: true,
    ...overrides
  };
}

function createMockSession(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439030',
    employee: '507f1f77bcf86cd799439020',
    employeeCode: 'NV0001',
    employeeName: 'Trần Văn Nam',
    workDate: '2026-10-01',
    kind: 'REGULAR',
    schedule: {
      name: 'Ca sáng',
      startAt: new Date('2026-10-01T08:00:00+07:00'),
      endAt: new Date('2026-10-01T16:00:00+07:00'),
      graceMinutes: 15
    },
    checkInAt: new Date('2026-10-01T07:55:00+07:00'),
    checkOutAt: null,
    state: 'OPEN',
    inStatus: 'ON_TIME',
    outStatus: null,
    revision: 1,
    toObject() {
      return {
        _id: this._id,
        employee: this.employee,
        employeeCode: this.employeeCode,
        employeeName: this.employeeName,
        workDate: this.workDate,
        kind: this.kind,
        schedule: this.schedule,
        checkInAt: this.checkInAt,
        checkOutAt: this.checkOutAt,
        state: this.state,
        inStatus: this.inStatus,
        outStatus: this.outStatus,
        revision: this.revision
      };
    },
    set(fields) {
      Object.assign(this, fields);
    },
    ...overrides
  };
  return doc;
}

// -------------------------------------------------------------
// 1. scan(body, context) - Check-in & Check-out
// -------------------------------------------------------------

test('UT_ATT_01: scan(body, context) - Check-in thành công khi đúng khung giờ ca', async () => {
  const customService = attendanceService.createAttendanceService({
    clock: () => new Date('2026-10-01T07:50:00+07:00') // 10 minutes before 08:00
  });

  const body = { employeeCode: 'NV0001', requestId: '11111111-1111-4111-8111-111111111111' };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };
  const employee = createMockEmployee();

  attendanceRepository.replay = async () => null;
  attendanceRepository.lockEmployee = async () => employee;
  attendanceRepository.openSession = async () => null; // No open session -> Check-in
  shiftRepository.assignmentsForDay = async () => [
    {
      _id: '507f1f77bcf86cd799439040',
      name: 'Ca sáng',
      startAt: new Date('2026-10-01T08:00:00+07:00'),
      endAt: new Date('2026-10-01T16:00:00+07:00'),
      graceMinutes: 15
    }
  ];
  attendanceRepository.sessionsForDay = async () => [];
  attendanceRepository.overlap = async () => false;
  attendanceRepository.create = async (payload) => createMockSession(payload);
  attendanceRepository.markScan = async () => {};
  attendanceRepository.completedForWeek = async () => [];
  attendanceRepository.employeeJob = async () => ({ role: 'cashier' });

  const result = await customService.scan(body, context);
  assert.equal(result.action, 'IN');
  assert.equal(result.employee.employeeCode, 'NV0001');
  assert.ok(result.bill);
});

test('UT_ATT_02: scan(body, context) - Check-out thành công cho phiên đang mở', async () => {
  const customService = attendanceService.createAttendanceService({
    clock: () => new Date('2026-10-01T16:05:00+07:00') // Check out at 16:05
  });

  const body = { employeeCode: 'NV0001', requestId: '22222222-2222-4222-8222-222222222222' };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };
  const employee = createMockEmployee();
  const openSession = createMockSession({
    checkInAt: new Date('2026-10-01T07:55:00+07:00'),
    state: 'OPEN'
  });

  attendanceRepository.replay = async () => null;
  attendanceRepository.lockEmployee = async () => employee;
  attendanceRepository.openSession = async () => openSession;
  attendanceRepository.save = async (s) => s;
  attendanceRepository.markScan = async () => {};
  attendanceRepository.completedForWeek = async () => [];
  attendanceRepository.employeeJob = async () => ({ role: 'cashier' });

  const result = await customService.scan(body, context);
  assert.equal(result.action, 'OUT');
  assert.equal(openSession.state, 'CLOSED');
  assert.ok(openSession.checkOutAt);
});

test('UT_ATT_03: scan(body, context) - Ném lỗi 429 khi quét trong thời gian cooldown (< 60s)', async () => {
  const customService = attendanceService.createAttendanceService({
    clock: () => new Date('2026-10-01T08:00:20+07:00')
  });

  const body = { employeeCode: 'NV0001', requestId: '33333333-3333-4333-8333-333333333333' };
  const employee = createMockEmployee({
    lastAttendanceAt: new Date('2026-10-01T08:00:00+07:00') // scanned 20 seconds ago
  });

  attendanceRepository.replay = async () => null;
  attendanceRepository.lockEmployee = async () => employee;

  await assert.rejects(
    async () => {
      await customService.scan(body, { actor: {} });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 429);
      assert.match(err.message, /vui lòng đợi/);
      return true;
    }
  );
});

test('UT_ATT_04: scan(body, context) - Ném lỗi khi nhân viên còn thiếu giờ ra từ ngày hôm trước (409)', async () => {
  const customService = attendanceService.createAttendanceService({
    clock: () => new Date('2026-10-02T08:00:00+07:00') // today is 2026-10-02
  });

  const body = { employeeCode: 'NV0001', requestId: '44444444-4444-4444-8444-444444444444' };
  const employee = createMockEmployee();
  const oldUnclosedSession = createMockSession({
    workDate: '2026-10-01', // yesterday
    state: 'OPEN'
  });

  attendanceRepository.replay = async () => null;
  attendanceRepository.lockEmployee = async () => employee;
  attendanceRepository.openSession = async () => oldUnclosedSession;

  await assert.rejects(
    async () => {
      await customService.scan(body, { actor: {} });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /còn thiếu giờ ra ngày/);
      return true;
    }
  );
});

test('UT_ATT_05: scan(body, context) - Yêu cầu duyệt ngoại lệ APPROVAL_REQUIRED khi ngoài khung giờ ca', async () => {
  const customService = attendanceService.createAttendanceService({
    clock: () => new Date('2026-10-01T06:00:00+07:00') // 2 hours before 08:00
  });

  const body = { employeeCode: 'NV0001', requestId: '55555555-5555-4555-8555-555555555555' };
  const employee = createMockEmployee();

  attendanceRepository.replay = async () => null;
  attendanceRepository.lockEmployee = async () => employee;
  attendanceRepository.openSession = async () => null;
  shiftRepository.assignmentsForDay = async () => [
    {
      _id: '507f1f77bcf86cd799439040',
      name: 'Ca sáng',
      startAt: new Date('2026-10-01T08:00:00+07:00'),
      endAt: new Date('2026-10-01T16:00:00+07:00')
    }
  ];
  attendanceRepository.sessionsForDay = async () => [];

  await assert.rejects(
    async () => {
      await customService.scan(body, { actor: {} });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.equal(err.details.code, 'APPROVAL_REQUIRED');
      return true;
    }
  );
});

// -------------------------------------------------------------
// 2. approveException(body, context)
// -------------------------------------------------------------

test('UT_ATT_06: approveException(body, context) - Duyệt ca ngoài giờ (mode = "SHIFT") thành công', async () => {
  const customService = attendanceService.createAttendanceService({
    clock: () => new Date('2026-10-01T06:00:00+07:00')
  });

  const shiftId = '507f1f77bcf86cd799439040';
  const body = {
    employeeCode: 'NV0001',
    requestId: '66666666-6666-4666-8666-666666666666',
    mode: 'SHIFT',
    employeeShiftId: shiftId,
    reason: 'Được quản lý gọi vào sớm chuẩn bị hàng'
  };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };
  const employee = createMockEmployee();

  attendanceRepository.replay = async () => null;
  attendanceRepository.lockEmployee = async () => employee;
  attendanceRepository.openSession = async () => null;
  shiftRepository.assignmentsForDay = async () => [
    {
      _id: shiftId,
      name: 'Ca sáng',
      startAt: new Date('2026-10-01T08:00:00+07:00'),
      endAt: new Date('2026-10-01T16:00:00+07:00'),
      graceMinutes: 15
    }
  ];
  attendanceRepository.sessionsForDay = async () => [];
  attendanceRepository.overlap = async () => false;
  attendanceRepository.create = async (payload) => createMockSession(payload);
  attendanceRepository.markScan = async () => {};
  attendanceRepository.completedForWeek = async () => [];
  attendanceRepository.employeeJob = async () => ({ role: 'cashier' });

  const result = await customService.approveException(body, context);
  assert.equal(result.action, 'IN');
  assert.equal(result.employee.employeeCode, 'NV0001');
});

test('UT_ATT_07: approveException(body, context) - Duyệt làm thêm giờ (mode = "OT") thành công', async () => {
  const customService = attendanceService.createAttendanceService({
    clock: () => new Date('2026-10-01T18:00:00+07:00')
  });

  const body = {
    employeeCode: 'NV0001',
    requestId: '77777777-7777-4777-8777-777777777777',
    mode: 'OT',
    endTime: '22:00',
    reason: 'Hỗ trợ ca tối'
  };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };
  const employee = createMockEmployee();

  attendanceRepository.replay = async () => null;
  attendanceRepository.lockEmployee = async () => employee;
  attendanceRepository.openSession = async () => null;
  shiftRepository.assignmentsForDay = async () => [];
  attendanceRepository.sessionsForDay = async () => [];
  attendanceRepository.overlap = async () => false;
  attendanceRepository.create = async (payload) => createMockSession({ ...payload, kind: 'OT' });
  attendanceRepository.markScan = async () => {};
  attendanceRepository.completedForWeek = async () => [];
  attendanceRepository.employeeJob = async () => ({ role: 'cashier' });

  const result = await customService.approveException(body, context);
  assert.equal(result.action, 'IN');
  assert.equal(result.kind, 'OT');
});

// -------------------------------------------------------------
// 3. correct(id, body, context) & cancel(id, body, context)
// -------------------------------------------------------------

test('UT_ATT_08: correct(id, body, context) - Ném lỗi khi revision bị cũ (STALE_REVISION)', async () => {
  const sessionId = '507f1f77bcf86cd799439030';
  const session = createMockSession({ _id: sessionId, revision: 2 });

  attendanceRepository.findSession = async () => session;
  attendanceRepository.lockEmployee = async () => ({});

  await assert.rejects(
    async () => {
      await attendanceService.correct(sessionId, {
        revision: 1, // Stale!
        checkInAt: '2026-10-01T08:00:00+07:00',
        checkOutAt: null,
        reason: 'Sửa giờ vào'
      }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.equal(err.details.code, 'STALE_REVISION');
      return true;
    }
  );
});

test('UT_ATT_09: cancel(id, body, context) - Hủy phiên chấm công thành công', async () => {
  const sessionId = '507f1f77bcf86cd799439030';
  const session = createMockSession({ _id: sessionId, revision: 1, state: 'OPEN' });

  attendanceRepository.findSession = async () => session;
  attendanceRepository.lockEmployee = async () => ({});
  attendanceRepository.save = async (s) => s;

  const result = await attendanceService.cancel(sessionId, {
    revision: 1,
    reason: 'Quẹt nhầm thẻ của đồng nghiệp'
  }, { actor: {} });

  assert.equal(result.state, 'CANCELLED');
  assert.equal(result.revision, 2);
  assert.equal(result.cancellationReason, 'Quẹt nhầm thẻ của đồng nghiệp');
});

// -------------------------------------------------------------
// 4. list(query), detail(id), history(id, query)
// -------------------------------------------------------------

test('UT_ATT_10: list(query) - Lấy danh sách bảng công có phân trang', async () => {
  attendanceRepository.list = async () => [createMockSession()];
  attendanceRepository.count = async () => 1;

  const result = await attendanceService.list({ page: '1' });
  assert.equal(result.items.length, 1);
  assert.equal(result.pagination.total, 1);
});

test('UT_ATT_11: detail(id) - Lấy chi tiết phiên chấm công thành công', async () => {
  const sessionId = '507f1f77bcf86cd799439030';
  attendanceRepository.detail = async () => createMockSession({ _id: sessionId });

  const result = await attendanceService.detail(sessionId);
  assert.equal(result._id, sessionId);
});

test('UT_ATT_12: detail(id) - Ném lỗi khi không tìm thấy phiên công (404)', async () => {
  attendanceRepository.detail = async () => null;

  await assert.rejects(
    async () => {
      await attendanceService.detail('507f1f77bcf86cd799439099');
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy phiên chấm công/);
      return true;
    }
  );
});
