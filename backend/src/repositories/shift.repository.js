const ShiftTemplate = require('../models/ShiftTemplate');
const EmployeeShift = require('../models/EmployeeShift');

function listTemplates() { return ShiftTemplate.find().sort({ startTime: 1, name: 1 }); }
function findTemplate(id, session) { return ShiftTemplate.findById(id).session(session); }
async function createTemplate(payload, session) { return (await ShiftTemplate.create([payload], { session }))[0]; }
function saveTemplate(document, session) { return document.save({ session }); }
function findAssignment(id, session) { return EmployeeShift.findById(id).session(session); }
function assignmentsForDay(employee, workDate, session) {
  return EmployeeShift.find({ employee, workDate, isActive: true }).sort({ startAt: 1, _id: 1 }).session(session);
}
function overlapping(employee, startAt, endAt, excludeId, session) {
  const query = { employee, isActive: true, startAt: { $lt: endAt }, endAt: { $gt: startAt } };
  if (excludeId) query._id = { $ne: excludeId };
  return EmployeeShift.exists(query).session(session);
}
async function createAssignment(payload, session) { return (await EmployeeShift.create([payload], { session }))[0]; }
function saveAssignment(document, session) { return document.save({ session }); }
function listAssignments(query, { skip, limit }) {
  return EmployeeShift.find(query).populate('employee', 'employeeCode fullName isActive')
    .populate('assignedBy', 'displayName username').sort({ workDate: -1, startAt: 1 }).skip(skip).limit(limit);
}
function countAssignments(query) { return EmployeeShift.countDocuments(query); }

module.exports = {
  listTemplates, findTemplate, createTemplate, saveTemplate, findAssignment, assignmentsForDay,
  overlapping, createAssignment, saveAssignment, listAssignments, countAssignments
};
