const { TIME_ZONE } = require('../constants/attendance');

const JOB_LABELS = Object.freeze({ admin: 'Administrator', cashier: 'Cashier', kitchen: 'Kitchen Staff', shipper: 'Delivery Staff' });
const NOTE = 'Note: This is verification for hours worked. Keep this for your records.';
const HOUR = 3600000;

function billSnapshot(response, requestId, role, week, completed) {
  const timeIn = new Date(response.checkInAt).toISOString();
  const timeOut = response.action === 'OUT' ? new Date(response.checkOutAt).toISOString() : null;
  return {
    requestId, employeeCode: response.employee.employeeCode, fullName: response.employee.fullName,
    job: JOB_LABELS[role] || 'Employee', action: response.action, workDate: response.workDate,
    timeIn, timeOut, shiftMilliseconds: timeOut ? new Date(timeOut) - new Date(timeIn) : null,
    weekMilliseconds: completed.reduce((total, row) => total + Math.max(0, new Date(row.checkOutAt) - new Date(row.checkInAt)), 0),
    weekFrom: week.from, weekToExclusive: week.toExclusive,
    fileName: `${response.employee.employeeCode}_Clock_${response.action}_${response.workDate}_${requestId}.docx`
  };
}

function hours(milliseconds) { return (milliseconds / HOUR).toFixed(2); }
function time(value) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date(value));
}

// The optional library argument lets document QA use the managed workspace runtime.
async function buildBill(bill, library = require('docx')) {
  const { Document, Paragraph, TextRun, Packer, AlignmentType, TabStopType } = library;
  const run = (text, options = {}) => new TextRun({ text, font: 'Arial', size: 21, color: '000000', ...options });
  const paragraph = (text, options = {}) => new Paragraph({
    children: [run(text)], spacing: { after: 100, line: 270 }, ...options
  });
  const field = (label, value) => new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: 3855 }], spacing: { after: 120, line: 270 },
    children: [run(`${label}:`), run(`\t${value}`, { bold: true })]
  });
  const children = [
    new Paragraph({ style: 'Title', alignment: AlignmentType.CENTER, spacing: { after: 100, line: 300 },
      children: [run(`Employee Clock ${bill.action === 'IN' ? 'In' : 'Out'}`, { bold: true, size: 26 })] }),
    paragraph(bill.workDate.split('-').reverse().join('/'), { alignment: AlignmentType.CENTER,
      children: [run(bill.workDate.split('-').reverse().join('/'), { size: 18 })], spacing: { after: 240 } }),
    paragraph(bill.fullName, { children: [run(bill.fullName, { bold: true, size: 24 })] }),
    paragraph(`Job: ${bill.job}`, { spacing: { after: 240, line: 270 } }),
    field('Time in', time(bill.timeIn))
  ];
  if (bill.action === 'OUT') children.push(field('Time out', time(bill.timeOut)), field('Hours this shift', hours(bill.shiftMilliseconds)));
  children.push(field('Hours this week', hours(bill.weekMilliseconds)),
    paragraph('*****************', { alignment: AlignmentType.CENTER, spacing: { before: 120, after: 140 } }),
    paragraph(NOTE, { children: [run(NOTE, { size: 16 })], spacing: { after: 0, line: 210 } }));
  const document = new Document({
    creator: 'Jollibee Attendance', title: `Employee Clock ${bill.action === 'IN' ? 'In' : 'Out'}`,
    description: 'Verification for hours worked',
    styles: { default: { document: { run: { font: 'Arial', size: 21, color: '000000' } } },
      paragraphStyles: [{ id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal',
        run: { font: 'Arial', size: 26, bold: true, color: '000000' } }] },
    sections: [{ properties: { page: { size: { width: 4535, height: 7087 },
      margin: { top: 340, right: 340, bottom: 340, left: 340, header: 0, footer: 0 } } }, children }]
  });
  return Packer.toBuffer(document);
}

module.exports = { billSnapshot, buildBill, hours, NOTE };
