const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { workDate, validateDate, validateTime, atTime, evaluate } = require('../src/utils/attendanceTime');
const validators = require('../src/validators/attendanceValidators');
const ScanQueue = require('../../frontend/admin/assets/js/scan-queue');

const schedule = { startAt: atTime('2026-09-29', '08:00'), endAt: atTime('2026-09-29', '12:00'), graceMinutes: 15 };

test('ngày công theo Việt Nam độc lập múi giờ máy chủ, đổi ngày lúc 17:00 UTC', () => {
  assert.equal(workDate('2026-09-28T16:59:59.999Z'), '2026-09-28');
  assert.equal(workDate('2026-09-28T17:00:00Z'), '2026-09-29');
  assert.equal(atTime('2026-09-29', '08:00').toISOString(), '2026-09-29T01:00:00.000Z');
});
test('không chấp nhận ngày nhuận sai, ngày bị normalize hoặc giờ vượt ngày', () => {
  assert.throws(() => validateDate('2026-02-29'));
  assert.throws(() => validateDate('2026-09-31'));
  assert.throws(() => validateTime('24:00'));
  assert.equal(validateDate('2028-02-29'), '2028-02-29');
});
test('đúng mốc ân hạn vẫn đúng giờ; vượt một giây tính muộn từ đầu ca', () => {
  assert.equal(evaluate(atTime('2026-09-29', '08:15'), null, schedule).lateMinutes, 0);
  assert.equal(evaluate(new Date('2026-09-29T08:15:01+07:00'), null, schedule).lateMinutes, 16);
  assert.equal(evaluate(atTime('2026-09-29', '08:20'), null, schedule).lateMinutes, 20);
});
test('vào sớm, về đúng giờ và về muộn không có số phút âm', () => {
  for (const out of ['12:00', '12:30']) {
    const result = evaluate(atTime('2026-09-29', '07:30'), atTime('2026-09-29', out), schedule);
    assert.equal(result.inStatus, 'ON_TIME'); assert.equal(result.outStatus, 'ON_TIME');
    assert.equal(result.lateMinutes, 0); assert.equal(result.earlyLeaveMinutes, 0);
  }
});
test('một phiên có thể vừa muộn vừa về sớm, làm tròn lên giây lẻ', () => {
  const result = evaluate(atTime('2026-09-29', '08:20'), new Date('2026-09-29T11:59:59+07:00'), schedule);
  assert.deepEqual(result, { inStatus: 'LATE', outStatus: 'EARLY_LEAVE', lateMinutes: 20, earlyLeaveMinutes: 1 });
});
test('OT không tính muộn nhưng so giờ ra với giờ kết thúc đã duyệt', () => {
  const result = evaluate(atTime('2026-09-29', '09:00'), atTime('2026-09-29', '11:00'), schedule, 'OT');
  assert.equal(result.lateMinutes, 0); assert.equal(result.earlyLeaveMinutes, 60);
});
test('ca qua đêm hoặc thời lượng bằng 0 bị từ chối', () => {
  for (const [startTime, endTime] of [['22:00', '06:00'], ['08:00', '08:00']]) {
    assert.throws(() => validators.template({ name: 'Ca', startTime, endTime }));
  }
});
test('mã được trim và uppercase, không tự thêm số 0 hay nhận mã QR tùy ý', () => {
  const requestId = randomUUID();
  assert.deepEqual(validators.scan({ employeeCode: ' nv0001 ', requestId }), { employeeCode: 'NV0001', requestId });
  assert.equal(validators.scan({ employeeCode: 'NV001', requestId }).employeeCode, 'NV001');
  assert.throws(() => validators.scan({ employeeCode: 'https://example.com/NV0001', requestId }));
  assert.throws(() => validators.scan({ employeeCode: 'NV0001', requestId: 'not-a-uuid' }));
});
test('duyệt ngoại lệ và sửa công bắt buộc lý do, revision và timestamp có múi giờ', () => {
  assert.throws(() => validators.exception({ employeeCode: 'NV0001', requestId: randomUUID(), mode: 'OT', endTime: '18:00', reason: ' ' }));
  assert.throws(() => validators.change({ reason: 'Đối chiếu camera', checkInAt: '2026-09-29T08:00:00' }));
  assert.throws(() => validators.change({ revision: 0, reason: 'Đối chiếu', checkInAt: '2026-09-29T08:00:00+07:00', checkOutAt: '2026-09-29T07:00:00+07:00' }));
  assert.throws(() => validators.change({ revision: 0, reason: 'Đối chiếu', checkInAt: '2026-09-31T08:00:00+07:00', checkOutAt: null }));
});
test('lọc ngày không cho khoảng đảo ngược hoặc object injection', () => {
  assert.throws(() => validators.filters({ from: '2026-09-30', to: '2026-09-29' }));
  assert.throws(() => validators.filters({ employeeId: { $ne: null } }));
});
test('payload trống hoặc sai kiểu trả lỗi 400, ObjectId được chuẩn hóa hoa/thường', () => {
  for (const value of [undefined, null, [], 'NV0001']) {
    assert.throws(() => validators.scan(value), error => error.statusCode === 400);
    assert.throws(() => validators.template(value), error => error.statusCode === 400);
    assert.throws(() => validators.assignment(value), error => error.statusCode === 400);
    assert.throws(() => validators.change(value), error => error.statusCode === 400);
  }
  assert.equal(validators.objectId('507F1F77BCF86CD799439011'), '507f1f77bcf86cd799439011');
});
test('hàng đợi giữ thứ tự, loại mã trùng đang xử lý và chờ duyệt trước người tiếp theo', async () => {
  const processed = []; let release;
  const blocked = new Promise(resolve => { release = resolve; });
  let done;
  const finished = new Promise(resolve => { done = resolve; });
  const queue = new ScanQueue(async code => {
    processed.push(code); if (code === 'NV0001') await blocked;
  }, count => { if (count === 0) done(); });
  assert.equal(queue.enqueue(' nv0001 '), true);
  assert.equal(queue.enqueue('NV0001'), false);
  assert.equal(queue.enqueue('NV0002'), true);
  assert.deepEqual(processed, ['NV0001']);
  release(); await finished;
  assert.deepEqual(processed, ['NV0001', 'NV0002']); assert.equal(queue.pending.size, 0);
});
test('hàng đợi dừng khi hết phiên và không chạy các mã còn chờ', async () => {
  const processed = []; let release;
  const blocked = new Promise(resolve => { release = resolve; });
  const queue = new ScanQueue(async code => { processed.push(code); await blocked; });
  queue.enqueue('NV0001'); queue.enqueue('NV0002'); queue.stop(); release();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(processed, ['NV0001']); assert.equal(queue.enqueue('NV0003'), false);
});
