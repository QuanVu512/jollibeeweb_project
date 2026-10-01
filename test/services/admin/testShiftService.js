const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../../backend');
const candidate2 = path.resolve(__dirname, '../../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const shiftRepository = require(path.join(backendRoot, 'src/repositories/shift.repository'));
const attendanceRepository = require(path.join(backendRoot, 'src/repositories/attendance.repository'));
const databaseRepository = require(path.join(backendRoot, 'src/repositories/database.repository'));
const auditLogRepository = require(path.join(backendRoot, 'src/repositories/auditLog.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));

// Mock defaults
auditLogRepository.create = async () => ({});
databaseRepository.isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
databaseRepository.transaction = async (work) => work({});

// Import target unit: shiftService
const shiftService = require(path.join(backendRoot, 'src/services/shiftService'));

function createMockTemplate(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439001',
    name: 'Ca sáng',
    startTime: '06:00',
    endTime: '14:00',
    isActive: true,
    toObject() {
      return {
        _id: this._id,
        name: this.name,
        startTime: this.startTime,
        endTime: this.endTime,
        isActive: this.isActive
      };
    },
    set(fields) {
      Object.assign(this, fields);
    },
    ...overrides
  };
  return doc;
}

function createMockAssignment(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439010',
    employee: '507f1f77bcf86cd799439020',
    template: '507f1f77bcf86cd799439001',
    name: 'Ca sáng',
    workDate: '2026-10-05',
    startAt: new Date('2026-10-05T06:00:00+07:00'),
    endAt: new Date('2026-10-05T14:00:00+07:00'),
    graceMinutes: 15,
    isActive: true,
    toObject() {
      return {
        _id: this._id,
        employee: this.employee,
        template: this.template,
        name: this.name,
        workDate: this.workDate,
        startAt: this.startAt,
        endAt: this.endAt,
        graceMinutes: this.graceMinutes,
        isActive: this.isActive
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
// 1. listTemplates()
// -------------------------------------------------------------

test('UT_SFT_01: listTemplates() - Lấy danh sách ca mẫu', async () => {
  shiftRepository.listTemplates = async () => [createMockTemplate()];

  const result = await shiftService.listTemplates();
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].name, 'Ca sáng');
});

// -------------------------------------------------------------
// 2. saveTemplate(id, body, context)
// -------------------------------------------------------------

test('UT_SFT_02: saveTemplate(null, body, context) - Tạo mới ca mẫu thành công', async () => {
  const body = { name: 'Ca chiều', startTime: '14:00', endTime: '22:00' };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };
  const mockCreated = createMockTemplate({ name: 'Ca chiều', startTime: '14:00', endTime: '22:00' });

  shiftRepository.createTemplate = async (payload) => {
    assert.equal(payload.name, 'Ca chiều');
    assert.equal(payload.startTime, '14:00');
    return mockCreated;
  };

  const result = await shiftService.saveTemplate(null, body, context);
  assert.equal(result.name, 'Ca chiều');
});

test('UT_SFT_03: saveTemplate(id, body, context) - Cập nhật ca mẫu thành công', async () => {
  const id = '507f1f77bcf86cd799439001';
  const existing = createMockTemplate({ _id: id });
  const body = { name: 'Ca sáng đổi giờ', startTime: '06:30', endTime: '14:30' };

  shiftRepository.findTemplate = async () => existing;
  shiftRepository.saveTemplate = async (item) => item;

  const result = await shiftService.saveTemplate(id, body, {});
  assert.equal(result.name, 'Ca sáng đổi giờ');
  assert.equal(result.startTime, '06:30');
});

test('UT_SFT_04: saveTemplate(id, body, context) - Ném lỗi khi giờ kết thúc không sau giờ bắt đầu', async () => {
  await assert.rejects(
    async () => {
      await shiftService.saveTemplate(null, { name: 'Ca lỗi', startTime: '14:00', endTime: '10:00' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Giờ kết thúc phải sau giờ bắt đầu/);
      return true;
    }
  );
});

test('UT_SFT_05: saveTemplate(id, body, context) - Ném lỗi khi không tìm thấy ca mẫu (404)', async () => {
  shiftRepository.findTemplate = async () => null;

  await assert.rejects(
    async () => {
      await shiftService.saveTemplate('507f1f77bcf86cd799439099', { name: 'Ca test', startTime: '08:00', endTime: '16:00' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy ca mẫu/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 3. listAssignments(query)
// -------------------------------------------------------------

test('UT_SFT_06: listAssignments(query) - Lấy danh sách phân ca có phân trang', async () => {
  shiftRepository.listAssignments = async () => [createMockAssignment()];
  shiftRepository.countAssignments = async () => 1;

  const result = await shiftService.listAssignments({ page: '1' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].name, 'Ca sáng');
  assert.equal(result.pagination.total, 1);
});

// -------------------------------------------------------------
// 4. saveAssignment(id, body, context)
// -------------------------------------------------------------

test('UT_SFT_07: saveAssignment(null, body, context) - Phân ca cho nhân viên thành công', async () => {
  const employeeId = '507f1f77bcf86cd799439020';
  const templateId = '507f1f77bcf86cd799439001';
  const body = {
    employeeId,
    templateId,
    workDate: '2026-10-05'
  };
  const context = { actor: { id: '507f1f77bcf86cd799439000' } };

  attendanceRepository.lockEmployee = async () => ({ _id: employeeId, fullName: 'Nguyễn Văn A' });
  shiftRepository.findTemplate = async () => createMockTemplate({ _id: templateId, isActive: true });
  shiftRepository.overlapping = async () => false;
  shiftRepository.createAssignment = async (fields) => createMockAssignment(fields);

  const result = await shiftService.saveAssignment(null, body, context);
  assert.equal(result.name, 'Ca sáng');
  assert.equal(result.workDate, '2026-10-05');
});

test('UT_SFT_08: saveAssignment(id, body, context) - Ném lỗi khi đổi nhân viên của lịch ca', async () => {
  const assignmentId = '507f1f77bcf86cd799439010';
  const old = createMockAssignment({ _id: assignmentId, employee: '507f1f77bcf86cd799439020' });
  shiftRepository.findAssignment = async () => old;

  await assert.rejects(
    async () => {
      await shiftService.saveAssignment(assignmentId, {
        employeeId: '507f1f77bcf86cd799439099', // different employee
        templateId: '507f1f77bcf86cd799439001',
        workDate: '2026-10-05'
      }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Không đổi nhân viên của lịch ca/);
      return true;
    }
  );
});

test('UT_SFT_09: saveAssignment(null, body, context) - Ném lỗi khi nhân viên đã có ca trùng hoặc chồng giờ (409)', async () => {
  const employeeId = '507f1f77bcf86cd799439020';
  const templateId = '507f1f77bcf86cd799439001';
  attendanceRepository.lockEmployee = async () => ({ _id: employeeId });
  shiftRepository.findTemplate = async () => createMockTemplate({ _id: templateId, isActive: true });
  shiftRepository.overlapping = async () => true; // Overlap detected!

  await assert.rejects(
    async () => {
      await shiftService.saveAssignment(null, {
        employeeId,
        templateId,
        workDate: '2026-10-05'
      }, { actor: {} });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Nhân viên đã có ca trùng hoặc chồng giờ/);
      return true;
    }
  );
});

test('UT_SFT_10: saveAssignment(id, body, context) - Ném lỗi khi lịch ca đã hủy hoặc đã có chấm công', async () => {
  const assignmentId = '507f1f77bcf86cd799439010';
  const employeeId = '507f1f77bcf86cd799439020';
  const old = createMockAssignment({ _id: assignmentId, employee: employeeId, isActive: false }); // already cancelled
  shiftRepository.findAssignment = async () => old;
  attendanceRepository.lockEmployee = async () => ({ _id: employeeId });

  await assert.rejects(
    async () => {
      await shiftService.saveAssignment(assignmentId, {
        employeeId,
        templateId: '507f1f77bcf86cd799439001',
        workDate: '2026-10-05'
      }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Lịch ca đã hủy hoặc đã có chấm công/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 5. cancelAssignment(id, body, context)
// -------------------------------------------------------------

test('UT_SFT_11: cancelAssignment(id, body, context) - Hủy lịch ca thành công với lý do hợp lệ', async () => {
  const assignmentId = '507f1f77bcf86cd799439010';
  const old = createMockAssignment({ _id: assignmentId, isActive: true });

  shiftRepository.findAssignment = async () => old;
  attendanceRepository.lockEmployee = async () => ({});
  attendanceRepository.assignmentUsed = async () => false;
  shiftRepository.saveAssignment = async (item) => item;

  let auditAction = null;
  auditLogRepository.create = async (entry) => {
    auditAction = entry.action;
  };

  const result = await shiftService.cancelAssignment(assignmentId, { reason: 'Nhân viên xin nghỉ phép đột xuất' }, {});
  assert.equal(result.isActive, false);
  assert.equal(auditAction, 'employeeShift.cancel');
});

test('UT_SFT_12: cancelAssignment(id, body, context) - Ném lỗi khi thiếu lý do hủy', async () => {
  await assert.rejects(
    async () => {
      await shiftService.cancelAssignment('507f1f77bcf86cd799439010', {}, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Lý do/);
      return true;
    }
  );
});

test('UT_SFT_13: cancelAssignment(id, body, context) - Ném lỗi khi lịch ca đã có chấm công thực tế (409)', async () => {
  const assignmentId = '507f1f77bcf86cd799439010';
  const old = createMockAssignment({ _id: assignmentId, isActive: true });

  shiftRepository.findAssignment = async () => old;
  attendanceRepository.lockEmployee = async () => ({});
  attendanceRepository.assignmentUsed = async () => true; // already used for attendance

  await assert.rejects(
    async () => {
      await shiftService.cancelAssignment(assignmentId, { reason: 'Muốn hủy ca đã chấm công' }, {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.match(err.message, /Lịch ca đã hủy hoặc đã có chấm công/);
      return true;
    }
  );
});
