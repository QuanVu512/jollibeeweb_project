const attendance = require('../services/attendanceService');
const shifts = require('../services/shiftService');
const auditContext = require('../utils/auditContext');
const bills = require('../services/attendanceBillService');

async function listTemplates(req, res) { res.json({ success: true, data: await shifts.listTemplates() }); }
async function createTemplate(req, res) { res.status(201).json({ success: true, data: { item: await shifts.saveTemplate(null, req.body, auditContext(req)) } }); }
async function updateTemplate(req, res) { res.json({ success: true, data: { item: await shifts.saveTemplate(req.params.id, req.body, auditContext(req)) } }); }
async function listAssignments(req, res) { res.json({ success: true, data: await shifts.listAssignments(req.query) }); }
async function createAssignment(req, res) { res.status(201).json({ success: true, data: { item: await shifts.saveAssignment(null, req.body, auditContext(req)) } }); }
async function updateAssignment(req, res) { res.json({ success: true, data: { item: await shifts.saveAssignment(req.params.id, req.body, auditContext(req)) } }); }
async function cancelAssignment(req, res) { res.json({ success: true, data: { item: await shifts.cancelAssignment(req.params.id, req.body, auditContext(req)) } }); }
async function list(req, res) { res.json({ success: true, data: await attendance.list(req.query) }); }
async function detail(req, res) { res.json({ success: true, data: { item: await attendance.detail(req.params.id) } }); }
async function history(req, res) { res.json({ success: true, data: await attendance.history(req.params.id, req.query) }); }
async function scan(req, res) { res.json({ success: true, data: await attendance.scan(req.body, auditContext(req)) }); }
async function approveException(req, res) { res.json({ success: true, data: await attendance.approveException(req.body, auditContext(req)) }); }
async function correct(req, res) { res.json({ success: true, data: { item: await attendance.correct(req.params.id, req.body, auditContext(req)) } }); }
async function cancel(req, res) { res.json({ success: true, data: { item: await attendance.cancel(req.params.id, req.body, auditContext(req)) } }); }
async function downloadBill(req, res) {
  const { fileName, buffer } = await bills.download(req.params.requestId, auditContext(req));
  res.set('Cache-Control', 'private, no-store');
  res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.attachment(fileName).send(buffer);
}

module.exports = { listTemplates, createTemplate, updateTemplate, listAssignments, createAssignment, updateAssignment, cancelAssignment, list, detail, history, scan, approveException, correct, cancel, downloadBill };
