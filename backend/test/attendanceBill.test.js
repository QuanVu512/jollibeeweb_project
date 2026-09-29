const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
// Inspect the OOXML using the same zip dependency shipped with docx.
const JSZip = createRequire(require.resolve('docx'))('jszip');
const { weekRange, atTime } = require('../src/utils/attendanceTime');
const { billSnapshot, buildBill, NOTE } = require('../src/utils/attendanceBill');

const week = { from: '2026-09-28', toExclusive: '2026-10-05' };
function response(action = 'IN') {
  return { employee: { employeeCode: 'NV0001', fullName: 'Nguyễn Văn An & Bình' }, action, workDate: '2026-09-29',
    checkInAt: atTime('2026-09-29', '13:00'), checkOutAt: action === 'OUT' ? atTime('2026-09-29', '16:45') : null };
}
async function xml(bill) {
  const zip = await JSZip.loadAsync(await buildBill(bill));
  return { body: await zip.file('word/document.xml').async('string'), styles: await zip.file('word/styles.xml').async('string') };
}

test('tuần bắt đầu thứ Hai theo Việt Nam, kể cả biên UTC và năm mới', () => {
  assert.deepEqual(weekRange('2026-10-04T16:59:59Z'), week);
  assert.deepEqual(weekRange('2026-10-04T17:00:00Z'), { from: '2026-10-05', toExclusive: '2026-10-12' });
  assert.deepEqual(weekRange('2027-01-01T08:00:00+07:00'), { from: '2026-12-28', toExclusive: '2027-01-04' });
});

test('bill IN phiên chiều không tính phiên đang mở; tổng tuần cộng trước khi làm tròn', () => {
  const completed = [
    { checkInAt: '2026-09-29T01:00:00Z', checkOutAt: '2026-09-29T01:00:20Z' },
    { checkInAt: '2026-09-29T02:00:00Z', checkOutAt: '2026-09-29T02:00:20Z' }
  ];
  const bill = billSnapshot(response(), 'test-uuid', undefined, week, completed);
  assert.equal(bill.timeOut, null); assert.equal(bill.shiftMilliseconds, null);
  assert.equal(bill.weekMilliseconds, 40000); assert.equal(bill.job, 'Employee');
});

test('Word IN 80 mm có tên, job, tổng tuần, Note nhỏ; không có giờ ra/công phiên', async () => {
  const bill = billSnapshot(response(), 'test-uuid', 'cashier', week, []);
  const { body, styles } = await xml(bill);
  for (const text of ['Employee Clock In', 'Nguyễn Văn An &amp; Bình', 'Job: Cashier', '13:00:00', 'Hours this week:', NOTE]) assert.ok(body.includes(text), text);
  assert.ok(!body.includes('Time out:')); assert.ok(!body.includes('Hours this shift:'));
  assert.match(body, /w:pgSz w:w="4535" w:h="7087"/);
  assert.match(body, /w:sz w:val="16"[^]*?Note: This is verification/);
  assert.match(body, /w:pStyle w:val="Title"/); assert.ok(styles.includes('w:color w:val="000000"'));
});

test('Word OUT chỉ tính 3.75 giờ của phiên chiều, tổng tuần cộng riêng', async () => {
  const event = response('OUT');
  const bill = billSnapshot(event, 'out-uuid', 'kitchen', week, [
    { checkInAt: atTime('2026-09-29', '08:00'), checkOutAt: atTime('2026-09-29', '12:00') },
    { checkInAt: event.checkInAt, checkOutAt: event.checkOutAt }
  ]);
  assert.equal(bill.shiftMilliseconds, 3.75 * 3600000); assert.equal(bill.weekMilliseconds, 7.75 * 3600000);
  const { body } = await xml(bill);
  for (const text of ['Employee Clock Out', 'Job: Kitchen Staff', 'Time out:', '16:45:00', 'Hours this shift:', '3.75', '7.75', '*****************']) assert.ok(body.includes(text), text);
});
