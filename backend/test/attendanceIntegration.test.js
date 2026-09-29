const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, randomBytes } = require('node:crypto');
const { createRequire } = require('node:module');
const JSZip = createRequire(require.resolve('docx'))('jszip');
// Prevent .env from supplying a real signing key to this isolated test process.
process.env.JWT_SECRET = randomBytes(32).toString('hex');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { mongodBinary, startLocalMongo } = require('../tools/localMongo.cjs');
const Employee = require('../src/models/Employee');
const User = require('../src/models/User');
const ShiftTemplate = require('../src/models/ShiftTemplate');
const EmployeeShift = require('../src/models/EmployeeShift');
const AttendanceSession = require('../src/models/AttendanceSession');
const AuditLog = require('../src/models/AuditLog');
const attendanceRepository = require('../src/repositories/attendance.repository');
const auditRepository = require('../src/repositories/auditLog.repository');
const { createAttendanceService } = require('../src/services/attendanceService');
const shifts = require('../src/services/shiftService');
const { atTime } = require('../src/utils/attendanceTime');
const { config } = require('../src/config/env');

const available = Boolean(mongodBinary());
const integration = (name, fn) => test(name, { skip: available ? false : 'Cần mongod; xem docs/ATTENDANCE.md.' }, fn);
let localMongo;
let server;
let base;
let now;
let employee;
let adminA;
let adminB;
let contextA;
let contextB;
const day = '2026-09-29';
const service = createAttendanceService({ clock: () => now });
const scan = (context = contextA, requestId = randomUUID(), code = employee.employeeCode) => service.scan({ employeeCode: code, requestId }, context);

before(async () => {
  if (!available) return;
  localMongo = await startLocalMongo();
  await mongoose.connect(localMongo.uri, { dbName: `kiosk_test_${randomUUID().replaceAll('-', '')}` });
  await Promise.all([Employee, User, ShiftTemplate, EmployeeShift, AttendanceSession, AuditLog].map(model => model.init()));
  const app = require('../src/app');
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api/v1/admin`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  if (mongoose.connection.readyState) await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  if (localMongo) await localMongo.stop();
});
beforeEach(async () => {
  if (!available) return;
  await Promise.all([Employee, User, ShiftTemplate, EmployeeShift, AttendanceSession, AuditLog].map(model => model.deleteMany({})));
  now = atTime(day, '08:00');
  [adminA, adminB] = await User.create([
    { username: 'admina', passwordHash: 'test-only', displayName: 'Quản lý A', role: 'admin' },
    { username: 'adminb', passwordHash: 'test-only', displayName: 'Quản lý B', role: 'admin' }
  ]);
  contextA = { actor: adminA._id, ipAddress: '127.0.0.1', userAgent: 'test' };
  contextB = { ...contextA, actor: adminB._id };
  employee = await Employee.create({ employeeCode: 'NV0001', fullName: 'Nguyễn Văn An', phone: '0912345678',
    email: 'employee@example.com', birthDate: '2000-01-01', gender: 'Nam', hometown: 'Hà Nội' });
});

async function assign(startTime = '08:00', endTime = '12:00', date = day, name = 'Ca sáng') {
  const template = await shifts.saveTemplate(null, { name, startTime, endTime }, contextA);
  return shifts.saveAssignment(null, { employeeId: String(employee._id), templateId: String(template._id), workDate: date }, contextA);
}
function token(user) {
  return jwt.sign({ sub: String(user._id), version: user.tokenVersion || 0 }, config.jwtSecret || 'attendance-test-secret-is-at-least-32-chars',
    { issuer: 'jollibee-admin-api', audience: 'jollibee-admin', expiresIn: '1h' });
}

integration('IN → OUT → ca tiếp theo và người ghi nhận từng đầu giờ khác nhau', async () => {
  await assign(); await assign('13:00', '17:00', day, 'Ca chiều');
  const input = await scan(); assert.equal(input.action, 'IN'); assert.equal(input.inStatus, 'ON_TIME');
  now = atTime(day, '12:00'); const output = await scan(contextB); assert.equal(output.action, 'OUT');
  now = atTime(day, '13:00'); const second = await scan(); assert.equal(second.action, 'IN'); assert.notEqual(second.sessionId, input.sessionId);
  assert.equal(input.bill.weekMilliseconds, 0); assert.equal(input.bill.shiftMilliseconds, null);
  assert.equal(output.bill.shiftMilliseconds, 4 * 3600000); assert.equal(output.bill.weekMilliseconds, 4 * 3600000);
  assert.equal(second.bill.timeOut, null); assert.equal(second.bill.shiftMilliseconds, null); assert.equal(second.bill.weekMilliseconds, 4 * 3600000);
  const first = await AttendanceSession.findById(input.sessionId);
  assert.equal(String(first.checkInRecordedBy), String(adminA._id)); assert.equal(String(first.checkOutRecordedBy), String(adminB._id));
  assert.equal(await AuditLog.countDocuments({ entityType: 'attendance' }), 3);
});

integration('bill tổng tuần chỉ gồm phiên CLOSED của nhân viên từ thứ Hai, gồm OUT vừa ghi và OT', async () => {
  const other = await Employee.create({ employeeCode: 'NV0002', fullName: 'Trần Thị Bình', phone: '0912345679',
    email: 'other@example.com', birthDate: '2000-01-01', gender: 'Nữ', hometown: 'Hà Nội' });
  async function completed(date, start, end, state = 'CLOSED', owner = employee, kind = 'REGULAR') {
    const startAt = atTime(date, start); const endAt = atTime(date, end);
    return AttendanceSession.create({ employee: owner._id, employeeCode: owner.employeeCode, employeeName: owner.fullName,
      workDate: date, state, kind, schedule: { name: 'Ca kiểm thử', startAt, endAt, graceMinutes: 15 },
      checkInAt: startAt, checkOutAt: endAt, inStatus: 'ON_TIME', outStatus: 'ON_TIME',
      checkInRecordedBy: adminA._id, checkOutRecordedBy: adminA._id });
  }
  await completed('2026-09-27', '08:00', '12:00'); // Sunday of the previous week.
  await completed('2026-09-28', '08:00', '10:00', 'CLOSED', employee, 'OT');
  await completed(day, '06:00', '07:00');
  await completed('2026-09-28', '12:00', '14:00', 'CANCELLED');
  await completed('2026-09-28', '08:00', '13:00', 'CLOSED', other);
  await completed('2026-09-30', '08:00', '09:00'); // Future CLOSED data is excluded at receipt time.
  await completed('2026-10-05', '08:00', '12:00');
  await assign(); const input = await scan();
  assert.equal(input.bill.weekMilliseconds, 3 * 3600000); assert.equal(input.bill.shiftMilliseconds, null);
  now = atTime(day, '12:00'); const output = await scan();
  assert.equal(output.bill.weekMilliseconds, 7 * 3600000); assert.equal(output.bill.shiftMilliseconds, 4 * 3600000);
  assert.equal(output.bill.weekFrom, '2026-09-28'); assert.equal(output.bill.weekToExclusive, '2026-10-05');
});

integration('download Word bảo vệ quyền, giữ bill gốc sau OUT/sửa/hủy và thay đổi job', async () => {
  const cashier = await User.create({ username: 'receiptcashier', passwordHash: 'test-only', role: 'cashier', employee: employee._id });
  await Employee.updateOne({ _id: employee._id }, { account: cashier._id });
  await assign(); const id = randomUUID(); const input = await scan(contextA, id);
  assert.equal(input.bill.job, 'Cashier');
  const url = `${base}/attendance/receipts/${id}`;
  const headers = { Authorization: `Bearer ${token(adminA)}` };
  assert.equal((await fetch(url)).status, 401);
  assert.equal((await fetch(url, { headers: { Authorization: `Bearer ${token(cashier)}` } })).status, 403);
  assert.equal((await fetch(url, { headers: { Authorization: `Bearer ${token(adminB)}` } })).status, 404);
  assert.equal((await fetch(`${base}/attendance/receipts/not-a-uuid`, { headers })).status, 400);
  assert.equal((await fetch(`${base}/attendance/receipts/${randomUUID()}`, { headers })).status, 404);
  now = atTime(day, '12:00'); const output = await scan();
  await service.correct(input.sessionId, { checkInAt: `${day}T08:30:00+07:00`, checkOutAt: `${day}T11:30:00+07:00`, revision: 1, reason: 'Đối chiếu camera' }, contextA);
  await service.cancel(input.sessionId, { revision: 2, reason: 'Hủy bản ghi thử' }, contextA);
  await User.updateOne({ _id: cashier._id }, { role: 'kitchen' });
  const replay = await scan(contextA, id); assert.deepEqual(replay.bill, input.bill);
  const res = await fetch(url, { headers });
  assert.equal(res.status, 200); assert.match(res.headers.get('content-type'), /wordprocessingml.document/);
  assert.ok(res.headers.get('content-disposition').includes(input.bill.fileName));
  assert.equal(res.headers.get('cache-control'), 'private, no-store');
  const zip = await JSZip.loadAsync(Buffer.from(await res.arrayBuffer()));
  const xml = await zip.file('word/document.xml').async('string');
  assert.ok(xml.includes('Employee Clock In')); assert.ok(xml.includes('08:00:00')); assert.ok(xml.includes('Job: Cashier'));
  assert.ok(!xml.includes('Time out:')); assert.ok(!xml.includes('Hours this shift:'));
  const outRes = await fetch(`${base}/attendance/receipts/${output.bill.requestId}`, { headers });
  const outZip = await JSZip.loadAsync(Buffer.from(await outRes.arrayBuffer()));
  const outXml = await outZip.file('word/document.xml').async('string');
  assert.ok(outXml.includes('Employee Clock Out')); assert.ok(outXml.includes('12:00:00')); assert.ok(outXml.includes('4.00'));
  assert.equal(await AuditLog.countDocuments({ entityType: 'attendance', requestId: { $exists: true } }), 2);
});
integration('cooldown 59 giây từ thành công gần nhất, 60 giây được checkout, lỗi không gia hạn', async () => {
  await assign(); await scan(); now = new Date(now.getTime() + 59000);
  await assert.rejects(scan(contextB), error => error.statusCode === 429 && error.details.retryAfterSeconds === 1);
  now = new Date(now.getTime() + 1000); assert.equal((await scan(contextB)).action, 'OUT');
  assert.equal(await AuditLog.countDocuments({ entityType: 'attendance' }), 2);
});
integration('hai quản lý quét đồng thời cùng mã chỉ ghi một lần', async () => {
  await assign(); const results = await Promise.allSettled([scan(contextA), scan(contextB)]);
  assert.equal(results.filter(row => row.status === 'fulfilled').length, 1);
  const failure = results.find(row => row.status === 'rejected'); assert.equal(failure.reason.statusCode, 429);
  assert.equal(await AttendanceSession.countDocuments(), 1); assert.equal(await AuditLog.countDocuments({ entityType: 'attendance' }), 1);
});
integration('retry requestId cùng lúc và sau cooldown trả lại IN, không thành OUT', async () => {
  await assign(); const id = randomUUID(); const results = await Promise.all([scan(contextA, id), scan(contextA, id)]);
  assert.equal(results[0].sessionId, results[1].sessionId);
  now = atTime(day, '10:00'); const replay = await scan(contextA, id);
  assert.equal(replay.action, 'IN'); assert.equal(new Date(replay.timestamp).getTime(), atTime(day, '08:00').getTime());
  assert.equal((await AttendanceSession.findById(replay.sessionId)).state, 'OPEN');
  assert.equal(await AuditLog.countDocuments({ entityType: 'attendance' }), 1);
});
integration('requestId không được tái sử dụng với mã hoặc loại yêu cầu khác', async () => {
  await assign(); const id = randomUUID(); await scan(contextA, id);
  await assert.rejects(scan(contextA, id, 'NV0002'), error => error.details.code === 'REQUEST_ID_REUSED');
  await assert.rejects(service.approveException({ employeeCode: employee.employeeCode, requestId: id, mode: 'OT', reason: 'OT', endTime: '18:00' }, contextA), error => error.details.code === 'REQUEST_ID_REUSED');
});
integration('30 phút trước ca hợp lệ, sớm hơn một giây cần duyệt', async () => {
  await assign(); now = new Date(`${day}T07:29:59+07:00`);
  await assert.rejects(scan(), error => error.details.code === 'APPROVAL_REQUIRED');
  assert.equal(await AttendanceSession.countDocuments(), 0);
  now = atTime(day, '07:30'); assert.equal((await scan()).inStatus, 'ON_TIME');
});
integration('15 phút ân hạn và quá ân hạn được tính đúng qua backend', async () => {
  const assignment = await assign(); now = atTime(day, '08:15'); const first = await scan(); assert.equal(first.lateMinutes, 0);
  await service.cancel(first.sessionId, { reason: 'Kiểm tra biên', revision: 0 }, contextA);
  now = atTime(day, '08:20'); const next = await scan(); assert.equal(next.lateMinutes, 20);
  assert.equal(String((await AttendanceSession.findById(next.sessionId)).employeeShift), String(assignment._id));
});
integration('hết giờ ca không tự vào, chọn đúng ca sau duyệt và lưu lý do', async () => {
  const assignment = await assign(); now = atTime(day, '12:00');
  await assert.rejects(scan(), error => error.details.code === 'APPROVAL_REQUIRED');
  const input = await service.approveException({ employeeCode: employee.employeeCode, requestId: randomUUID(), mode: 'SHIFT',
    employeeShiftId: String(assignment._id), reason: 'Quản lý xác nhận bổ sung' }, contextA);
  assert.equal(input.action, 'IN'); assert.equal(input.lateMinutes, 240);
  const item = await AttendanceSession.findById(input.sessionId);
  assert.equal(item.approval.reason, 'Quản lý xác nhận bổ sung'); assert.equal(String(item.approval.actor), String(adminA._id));
});
integration('nhiều cửa sổ hợp lệ chọn ca có giờ bắt đầu sớm nhất', async () => {
  const first = await assign('08:00', '10:00'); await assign('10:00', '12:00', day, 'Ca kế'); now = atTime(day, '09:45');
  const input = await scan(); assert.equal(String((await AttendanceSession.findById(input.sessionId)).employeeShift), String(first._id));
});
integration('ca đã hoàn tất không mở lại, chuyển duyệt OT', async () => {
  await assign(); await scan(); now = atTime(day, '12:00'); await scan(); now = atTime(day, '12:01');
  await assert.rejects(scan(), error => error.details.code === 'APPROVAL_REQUIRED' && error.details.assignments.length === 0);
  assert.equal(await AttendanceSession.countDocuments(), 1);
});
integration('không có ca: chưa ghi công, OT cần giờ kết thúc sau hiện tại và lưu audit', async () => {
  await assert.rejects(scan(), error => error.details.code === 'APPROVAL_REQUIRED');
  const base = { employeeCode: employee.employeeCode, requestId: randomUUID(), mode: 'OT', reason: 'Hỗ trợ cửa hàng' };
  await assert.rejects(service.approveException({ ...base, endTime: '07:59' }, contextA), error => error.statusCode === 400);
  const result = await service.approveException({ ...base, endTime: '10:00' }, contextA);
  assert.equal(result.kind, 'OT'); assert.equal(result.lateMinutes, 0);
  now = atTime(day, '09:00'); assert.equal((await scan(contextB)).earlyLeaveMinutes, 60);
  assert.equal((await AuditLog.findOne({ requestId: base.requestId })).reason, base.reason);
});
integration('duyệt ngoại lệ phải kiểm tra lại cooldown và trạng thái hiện tại', async () => {
  const assignment = await assign();
  await scan(contextB);
  const approval = { employeeCode: employee.employeeCode, requestId: randomUUID(), mode: 'SHIFT', employeeShiftId: String(assignment._id), reason: 'Duyệt ca' };
  await assert.rejects(service.approveException(approval, contextA), error => error.statusCode === 429);
  now = atTime(day, '08:02');
  await assert.rejects(service.approveException(approval, contextA), error => error.details.code === 'STATE_CHANGED');
  assert.equal((await AttendanceSession.findOne()).state, 'OPEN');
});
integration('qua ngày không tự checkout; bổ sung giờ ra ngày cũ rồi quét lại', async () => {
  await assign(); const input = await scan(); now = atTime('2026-09-30', '08:00');
  await assert.rejects(scan(), error => error.details.code === 'UNCLOSED_SESSION');
  await service.correct(input.sessionId, { checkInAt: `${day}T08:00:00+07:00`, checkOutAt: `${day}T12:00:00+07:00`, reason: 'Đối chiếu camera', revision: 0 }, contextB);
  await assign('08:00', '12:00', '2026-09-30'); assert.equal((await scan()).action, 'IN');
  assert.equal(String((await AttendanceSession.findById(input.sessionId)).checkOutRecordedBy), String(adminB._id));
});
integration('sửa công tính lại muộn/về sớm, giữ người ghi gốc và before/after', async () => {
  await assign(); const input = await scan(); now = atTime(day, '12:00'); await scan();
  const item = await service.correct(input.sessionId, { checkInAt: `${day}T08:20:00+07:00`, checkOutAt: `${day}T11:30:00+07:00`, reason: 'Camera xác nhận', revision: 1 }, contextB);
  assert.equal(item.lateMinutes, 20); assert.equal(item.earlyLeaveMinutes, 30);
  assert.equal(String(item.checkInRecordedBy), String(adminA._id)); assert.equal(String(item.checkOutRecordedBy), String(adminA._id));
  const audit = await AuditLog.findOne({ action: 'attendance.correct' });
  assert.equal(audit.before.lateMinutes, 0); assert.equal(audit.after.lateMinutes, 20); assert.equal(String(audit.actor), String(adminB._id));
});
integration('sửa công chặn chồng phiên, vượt ngày, giờ tương lai và revision cũ', async () => {
  await assign(); await assign('13:00', '17:00', day, 'Ca chiều'); const first = await scan();
  now = atTime(day, '12:00'); await scan(); now = atTime(day, '13:00'); const second = await scan(); now = atTime(day, '17:00'); await scan();
  const base = { reason: 'Kiểm tra lỗi', revision: 1, checkInAt: `${day}T13:00:00+07:00`, checkOutAt: `${day}T17:00:00+07:00` };
  await assert.rejects(service.correct(second.sessionId, { ...base, checkInAt: `${day}T11:00:00+07:00` }, contextA), error => error.details.code === 'SESSION_OVERLAP');
  await assert.rejects(service.correct(second.sessionId, { ...base, checkOutAt: '2026-09-30T01:00:00+07:00' }, contextA), error => error.statusCode === 400);
  await assert.rejects(service.correct(second.sessionId, { ...base, checkOutAt: `${day}T18:00:00+07:00` }, contextA), error => error.statusCode === 400);
  await assert.rejects(service.correct(first.sessionId, { ...base, revision: 0 }, contextA), error => error.details.code === 'STALE_REVISION');
});
integration('hủy mềm giữ dữ liệu gốc, lý do và lịch sử; không hủy hoặc sửa lại', async () => {
  await assign(); const input = await scan();
  const item = await service.cancel(input.sessionId, { reason: 'Ghi nhận nhầm', revision: 0 }, contextB);
  assert.equal(item.state, 'CANCELLED'); assert.equal(String(item.checkInRecordedBy), String(adminA._id)); assert.equal(item.cancellationReason, 'Ghi nhận nhầm');
  assert.equal(await AttendanceSession.countDocuments(), 1);
  await assert.rejects(service.cancel(input.sessionId, { reason: 'Hủy lại', revision: 1 }, contextA), error => error.details.code === 'CANCELLED_SESSION');
  assert.equal(await AuditLog.countDocuments({ entityType: 'attendance' }), 2);
});
integration('lỗi ghi audit rollback IN và cooldown, cho quét lại thành công', async () => {
  await assign(); const original = auditRepository.create;
  auditRepository.create = async () => { throw new Error('Simulated audit failure'); };
  try { await assert.rejects(scan(), /Simulated audit failure/); } finally { auditRepository.create = original; }
  assert.equal(await AttendanceSession.countDocuments(), 0);
  assert.equal((await Employee.findById(employee._id).select('+lastAttendanceAt')).lastAttendanceAt, null);
  assert.equal((await scan()).action, 'IN');
});
integration('lỗi ghi audit rollback cả OUT, giờ ra và cooldown', async () => {
  await assign(); const input = await scan(); now = atTime(day, '12:00'); const original = auditRepository.create;
  auditRepository.create = async () => { throw new Error('Audit outage'); };
  try { await assert.rejects(scan(contextB), /Audit outage/); } finally { auditRepository.create = original; }
  const item = await AttendanceSession.findById(input.sessionId); assert.equal(item.state, 'OPEN'); assert.equal(item.checkOutAt, null);
  assert.equal((await scan(contextB)).action, 'OUT');
});
integration('không phân ca chồng giờ, ca sát nhau hợp lệ và snapshot không đổi theo ca mẫu', async () => {
  const assigned = await assign();
  await assert.rejects(assign('11:00', '13:00', day, 'Ca trùng'), error => error.statusCode === 409);
  await assign('12:00', '14:00', day, 'Ca kế');
  await shifts.saveTemplate(String(assigned.template), { name: 'Đã đổi', startTime: '09:00', endTime: '13:00' }, contextA);
  const stored = await EmployeeShift.findById(assigned._id); assert.equal(stored.name, 'Ca sáng'); assert.equal(stored.startAt.getTime(), atTime(day, '08:00').getTime());
});
integration('hai yêu cầu phân ca chồng đồng thời không lọt qua kiểm tra', async () => {
  const a = await shifts.saveTemplate(null, { name: 'A', startTime: '08:00', endTime: '12:00' }, contextA);
  const b = await shifts.saveTemplate(null, { name: 'B', startTime: '10:00', endTime: '14:00' }, contextB);
  const result = await Promise.allSettled([a, b].map(template => shifts.saveAssignment(null, { employeeId: String(employee._id), templateId: String(template._id), workDate: day }, contextA)));
  assert.equal(result.filter(row => row.status === 'fulfilled').length, 1); assert.equal(await EmployeeShift.countDocuments(), 1);
});
integration('ca đã có công không sửa/hủy, kể cả công đã hủy', async () => {
  const assigned = await assign(); const input = await scan(); await service.cancel(input.sessionId, { reason: 'Nhầm', revision: 0 }, contextA);
  await assert.rejects(shifts.saveAssignment(String(assigned._id), { employeeId: String(employee._id), templateId: String(assigned.template), workDate: day }, contextA), error => error.statusCode === 409);
  await assert.rejects(shifts.cancelAssignment(String(assigned._id), { reason: 'Hủy' }, contextA), error => error.statusCode === 409);
});
integration('nhân viên không cần tài khoản; mã không có và nhân viên đã nghỉ không được quét', async () => {
  assert.equal(employee.account, undefined); await assign(); await assert.rejects(scan(contextA, randomUUID(), 'NV9999'), error => error.statusCode === 404);
  await Employee.updateOne({ _id: employee._id }, { isActive: false });
  await assert.rejects(scan(), error => error.statusCode === 404); assert.equal(await AttendanceSession.countDocuments(), 0);
});
integration('HTTP bảo vệ toàn bộ API, trả details cooldown và hiển thị người ghi audit', async () => {
  // Configure only a test secret when no local .env supplied one.
  if (!config.jwtSecret) config.jwtSecret = 'attendance-test-secret-is-at-least-32-chars';
  await assign();
  assert.equal((await fetch(`${base}/attendance`)).status, 401);
  const cashier = await User.create({ username: 'cashier', passwordHash: 'test-only', role: 'cashier' });
  const cashierHeaders = { Authorization: `Bearer ${token(cashier)}`, 'Content-Type': 'application/json' };
  for (const endpoint of ['/attendance', '/shift-templates', '/employee-shifts']) assert.equal((await fetch(`${base}${endpoint}`, { headers: cashierHeaders })).status, 403);
  for (const endpoint of ['/attendance/scan', '/attendance/exceptions', '/shift-templates', '/employee-shifts']) {
    assert.equal((await fetch(`${base}${endpoint}`, { method: 'POST', headers: cashierHeaders, body: '{}' })).status, 403);
  }
  const headers = { Authorization: `Bearer ${token(adminA)}`, 'Content-Type': 'application/json' };
  // Inject a deterministic server clock into the same service used by the HTTP controller.
  const defaultService = require('../src/services/attendanceService');
  const original = defaultService.scan;
  defaultService.scan = service.scan;
  let recorded;
  try {
    const res = await fetch(`${base}/attendance/scan`, { method: 'POST', headers, body: JSON.stringify({ employeeCode: ' nv0001 ', requestId: randomUUID(), recordedBy: String(adminB._id) }) });
    assert.equal(res.status, 200); recorded = (await res.json()).data;
    assert.equal(recorded.employee.avatar, undefined);
    const empty = await fetch(`${base}/attendance/scan`, { method: 'POST', headers });
    assert.equal(empty.status, 400);
    const duplicate = await fetch(`${base}/attendance/scan`, { method: 'POST', headers, body: JSON.stringify({ employeeCode: 'NV0001', requestId: randomUUID() }) });
    assert.equal(duplicate.status, 429); assert.equal((await duplicate.json()).details.retryAfterSeconds, 60);
  } finally { defaultService.scan = original; }
  const list = await (await fetch(`${base}/attendance?from=${day}&to=${day}`, { headers })).json();
  assert.equal(list.data.items[0].checkInRecordedBy.displayName, 'Quản lý A');
  const history = await (await fetch(`${base}/attendance/${recorded.sessionId}/history`, { headers })).json();
  assert.equal(history.data.items[0].actor.displayName, 'Quản lý A');
  assert.equal(history.data.items[0].response, undefined);
});

integration('hai sửa công đồng thời dùng cùng revision chỉ một yêu cầu thành công', async () => {
  await assign(); const input = await scan(); now = atTime(day, '12:00'); await scan();
  const payload = { checkInAt: `${day}T08:05:00+07:00`, checkOutAt: `${day}T12:00:00+07:00`, revision: 1, reason: 'Đối chiếu công' };
  const result = await Promise.allSettled([service.correct(input.sessionId, payload, contextA), service.correct(input.sessionId, payload, contextB)]);
  assert.equal(result.filter(row => row.status === 'fulfilled').length, 1);
  assert.equal(result.find(row => row.status === 'rejected').reason.details.code, 'STALE_REVISION');
  assert.equal(await AuditLog.countDocuments({ action: 'attendance.correct' }), 1);
});

integration('hai nhân viên cạnh tranh một UUID không làm lưu nhầm dữ liệu', async () => {
  const other = await Employee.create({ employeeCode: 'NV0002', fullName: 'Trần Văn Bình', phone: '0912345679',
    email: 'other@example.com', birthDate: '2000-01-01', gender: 'Nam', hometown: 'Hà Nội' });
  const requestId = randomUUID();
  const make = code => service.approveException({ employeeCode: code, requestId, mode: 'OT', endTime: '12:00', reason: 'Hỗ trợ' }, contextA);
  const result = await Promise.allSettled([make(employee.employeeCode), make(other.employeeCode)]);
  assert.equal(result.filter(row => row.status === 'fulfilled').length, 1);
  assert.equal(result.find(row => row.status === 'rejected').reason.details.code, 'REQUEST_ID_REUSED');
  assert.equal(await AttendanceSession.countDocuments(), 1);
});

integration('lọc và phân trang công theo nhân viên, ngày, phiên và đánh giá', async () => {
  await assign(); now = atTime(day, '08:20'); const input = await scan(); now = atTime(day, '11:30'); await scan();
  const serviceApi = require('../src/services/attendanceService');
  const result = await serviceApi.list({ from: day, to: day, employeeId: String(employee._id), state: 'CLOSED', status: 'LATE', page: '1', limit: '1' });
  assert.equal(result.pagination.total, 1); assert.equal(String(result.items[0]._id), input.sessionId);
  assert.equal((await serviceApi.list({ status: 'EARLY_LEAVE' })).pagination.total, 1);
  assert.equal((await serviceApi.list({ status: 'ON_TIME' })).pagination.total, 0);
  assert.equal((await serviceApi.list({ from: '2026-09-30', to: '2026-09-30' })).pagination.total, 0);
  assert.equal((await serviceApi.history(input.sessionId, { limit: '1' })).pagination.totalPages, 2);
});

integration('index chặn hai phiên OPEN và hai phiên sống cho cùng lịch ca', async () => {
  await assign(); const input = await scan(); const item = await AttendanceSession.findById(input.sessionId);
  const copy = item.toObject(); delete copy._id;
  await assert.rejects(AttendanceSession.create(copy), error => error.code === 11000);
  assert.equal(await AttendanceSession.countDocuments(), 1);
});

integration('bootstrap tạo collection/index chấm công và giữ nguyên hồ sơ nhân viên', async () => {
  const { initializeDatabase } = require('../src/services/databaseBootstrap');
  const before = employee.toObject();
  // Represent an existing profile created before the attendance fields were added.
  await Employee.updateOne({ _id: employee._id }, { $unset: { attendanceRevision: 1, lastAttendanceAt: 1 } });
  const result = await initializeDatabase();
  for (const name of ['shifttemplates', 'employeeshifts', 'attendancesessions']) assert.ok(result.collections.includes(name));
  const indexes = await AttendanceSession.collection.indexes();
  assert.ok(indexes.some(index => index.unique && index.partialFilterExpression?.state === 'OPEN'));
  const after = (await Employee.findById(employee._id)).toObject();
  assert.equal(after.employeeCode, before.employeeCode); assert.equal(after.fullName, before.fullName);
  assert.equal(await Employee.countDocuments(), 1);
  const legacy = await Employee.collection.findOne({ _id: employee._id });
  assert.equal(Object.hasOwn(legacy, 'attendanceRevision'), false);
  await assign(); const recorded = await scan();
  assert.equal(recorded.employee.id, String(employee._id));
  const updated = await Employee.collection.findOne({ _id: employee._id });
  assert.ok(updated.attendanceRevision > 0); assert.equal(updated.lastAttendanceAt.getTime(), now.getTime());
});
