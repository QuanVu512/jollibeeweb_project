const { randomBytes } = require('node:crypto');
const mongoose = require('mongoose');
const { startLocalMongo } = require('./localMongo.cjs');

async function main() {
  const local = await startLocalMongo();
  let server;
  let stopping = false;
  async function stop() {
    if (stopping) return;
    stopping = true;
    if (server) await new Promise(resolve => server.close(resolve));
    await mongoose.disconnect();
    await local.stop();
  }
  process.once('SIGINT', () => stop().then(() => process.exit(0)).catch(error => { console.error(error.message); process.exit(1); }));
  process.once('SIGTERM', () => stop().then(() => process.exit(0)).catch(error => { console.error(error.message); process.exit(1); }));
  try {
    // All data and signing keys are disposable; never use the project's configured database.
    process.env.JWT_SECRET = randomBytes(32).toString('hex');
    process.env.MONGODB_URI = local.uri;
    await mongoose.connect(local.uri, { dbName: 'jollibee_kiosk_demo' });
    const Employee = require('../src/models/Employee');
    const User = require('../src/models/User');
    const ShiftTemplate = require('../src/models/ShiftTemplate');
    const EmployeeShift = require('../src/models/EmployeeShift');
    const AttendanceSession = require('../src/models/AttendanceSession');
    const AuditLog = require('../src/models/AuditLog');
    const { workDate, atTime, evaluate } = require('../src/utils/attendanceTime');
    const { recordAudit } = require('../src/services/auditService');
    await Promise.all([Employee, User, ShiftTemplate, EmployeeShift, AttendanceSession, AuditLog].map(model => model.init()));
    const passwordHash = await User.hashPassword('DemoKiosk123');
    const [adminA, adminB] = await User.create([
      { username: 'demoadmina', passwordHash, displayName: 'Quản lý Demo A', role: 'admin' },
      { username: 'demoadminb', passwordHash, displayName: 'Quản lý Demo B', role: 'admin' }
    ]);
    await User.create({ username: 'democashier', passwordHash, displayName: 'Thu ngân Demo', role: 'cashier' });
    const employees = await Employee.create(['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Minh Cường', 'Phạm Thị Dung'].map((fullName, index) => ({
      employeeCode: `NV000${index + 1}`, fullName, phone: `091234567${index + 1}`, email: `demo${index + 1}@example.com`,
      birthDate: '2000-01-01', gender: index % 2 ? 'Nữ' : 'Nam', hometown: 'Hà Nội'
    })));
    const now = new Date(); const today = workDate(now);
    const localClock = new Date(now.getTime() + 7 * 3600000);
    const minutes = localClock.getUTCHours() * 60 + localClock.getUTCMinutes();
    if (minutes >= 1439) throw new Error('Demo ca trong ngày cần bắt đầu trước 23:59. Hãy chạy lại vào ngày tiếp theo.');
    const hhmm = value => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
    const startTime = hhmm(Math.max(0, minutes - 2));
    const endTime = hhmm(Math.min(1439, minutes + 60));
    const template = await ShiftTemplate.create({ name: 'Ca demo hôm nay', startTime, endTime });
    await EmployeeShift.create(employees.slice(0, 2).map(employee => ({
      employee: employee._id, template: template._id, workDate: today, name: template.name,
      startAt: atTime(today, startTime), endAt: atTime(today, endTime), assignedBy: adminA._id
    })));
    const yesterday = workDate(new Date(now.getTime() - 24 * 3600000));
    const old = await EmployeeShift.create({ employee: employees[3]._id, template: template._id, workDate: yesterday,
      name: 'Ca demo hôm trước', startAt: atTime(yesterday, '08:00'), endAt: atTime(yesterday, '12:00'), assignedBy: adminA._id });
    const schedule = { name: old.name, startAt: old.startAt, endAt: old.endAt, graceMinutes: 15 };
    const forgotten = await AttendanceSession.create({ employee: employees[3]._id, employeeCode: employees[3].employeeCode,
      employeeName: employees[3].fullName, employeeShift: old._id, workDate: yesterday, schedule,
      checkInAt: old.startAt, checkInRecordedBy: adminA._id, ...evaluate(old.startAt, null, schedule) });
    await recordAudit({ actor: adminA._id, ipAddress: '127.0.0.1', userAgent: 'isolated-demo-fixture' }, {
      action: 'attendance.checkIn', entityType: 'attendance', entityId: forgotten._id, after: forgotten
    });
    const app = require('../src/app');
    const port = Number(process.env.KIOSK_DEMO_PORT || 0);
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('KIOSK_DEMO_PORT không hợp lệ.');
    server = app.listen(port, '127.0.0.1');
    await new Promise((resolve, reject) => { server.once('listening', resolve); server.once('error', reject); });
    const url = `http://127.0.0.1:${server.address().port}`;
    console.log(`Demo riêng sẵn sàng: ${url}/admin/login.html`);
    console.log('Tài khoản: demoadmina / demoadminb. Mật khẩu demo: DemoKiosk123');
    console.log('NV0001, NV0002: ca hôm nay. NV0003: cần duyệt OT. NV0004: thiếu checkout hôm trước.');
    console.log('Cooldown giữ nguyên 60 giây; thời gian máy chủ không đổi. Ctrl+C để dừng và xóa database tạm.');
  } catch (error) { await stop(); throw error; }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
