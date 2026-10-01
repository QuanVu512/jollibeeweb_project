const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../../backend');
const candidate2 = path.resolve(__dirname, '../../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const attendanceRepository = require(path.join(backendRoot, 'src/repositories/attendance.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));

// Import target unit: attendanceBillService
const attendanceBillService = require(path.join(backendRoot, 'src/services/attendanceBillService'));

// -------------------------------------------------------------
// download(id, context)
// -------------------------------------------------------------

test('UT_BIL_01: download(id, context) - Tải file hóa đơn chấm công (.docx) thành công', async () => {
  const reqId = '11111111-2222-4333-8444-555555555555';
  const mockBill = {
    fileName: 'NV0001_Clock_IN_2026-10-01_11111111-2222-4333-8444-555555555555.docx',
    employeeCode: 'NV0001',
    fullName: 'Trần Văn Nam',
    job: 'Cashier',
    action: 'IN',
    workDate: '2026-10-01',
    timeIn: '2026-10-01T07:55:00.000Z',
    timeOut: null,
    shiftMilliseconds: null,
    weekMilliseconds: 14400000
  };

  attendanceRepository.replay = async (actor, id) => {
    assert.equal(id, reqId);
    return {
      entityType: 'attendance',
      response: { bill: mockBill }
    };
  };

  const result = await attendanceBillService.download(reqId, { actor: 'admin-user' });
  assert.equal(result.fileName, mockBill.fileName);
  assert.ok(result.buffer instanceof Uint8Array || Buffer.isBuffer(result.buffer));
});

test('UT_BIL_02: download(id, context) - Ném lỗi 400 khi requestId không phải UUID', async () => {
  await assert.rejects(
    async () => {
      await attendanceBillService.download('invalid-uuid', { actor: 'admin-user' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /requestId phải là UUID/);
      return true;
    }
  );
});

test('UT_BIL_03: download(id, context) - Ném lỗi 404 khi không tìm thấy bill của lượt ghi nhận', async () => {
  attendanceRepository.replay = async () => null;

  await assert.rejects(
    async () => {
      await attendanceBillService.download('11111111-2222-4333-8444-555555555555', { actor: 'admin-user' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy bill của lượt ghi nhận này/);
      return true;
    }
  );
});
