const Employee = require('../models/Employee');
const AttendanceSession = require('../models/AttendanceSession');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// All attendance and assignment writers touch the same employee before reading state.
// MongoDB retries a conflicting transaction against a fresh snapshot.
function lockEmployee(query, session) {
  return Employee.findOneAndUpdate(query, { $inc: { attendanceRevision: 1 } }, { returnDocument: 'after', session })
    .select('+lastAttendanceAt +attendanceRevision');
}
function markScan(employee, timestamp, session) {
  return Employee.updateOne({ _id: employee }, { $set: { lastAttendanceAt: timestamp } }, { session });
}
function findSession(id, session) { return AttendanceSession.findById(id).session(session); }
function openSession(employee, session) { return AttendanceSession.findOne({ employee, state: 'OPEN' }).session(session); }
function sessionsForDay(employee, workDate, session) {
  return AttendanceSession.find({ employee, workDate, state: { $ne: 'CANCELLED' } }).session(session);
}
function completedForWeek(employee, week, timestamp, session) {
  return AttendanceSession.find({ employee, state: 'CLOSED',
    workDate: { $gte: week.from, $lt: week.toExclusive }, checkOutAt: { $ne: null, $lte: timestamp }
  }).select('checkInAt checkOutAt').session(session).lean();
}
function employeeJob(employee, session) {
  return User.findOne(employee.account ? { _id: employee.account } : { employee: employee._id })
    .select('role').session(session).lean();
}
function assignmentUsed(employeeShift, session) { return AttendanceSession.exists({ employeeShift }).session(session); }
async function create(payload, session) { return (await AttendanceSession.create([payload], { session }))[0]; }
function save(document, session) { return document.save({ session }); }
function overlap(employee, startAt, endAt, excludeId, session) {
  const query = {
    employee, state: { $ne: 'CANCELLED' }, checkInAt: { $lt: endAt },
    $or: [{ checkOutAt: null }, { checkOutAt: { $gt: startAt } }]
  };
  if (excludeId) query._id = { $ne: excludeId };
  return AttendanceSession.exists(query).session(session);
}
function populate(query) {
  return query.populate('checkInRecordedBy checkOutRecordedBy approval.actor cancelledBy', 'displayName username')
    .populate('employee', 'employeeCode fullName isActive');
}
function detail(id) { return populate(AttendanceSession.findById(id)); }
function list(query, { skip, limit }) {
  return populate(AttendanceSession.find(query).sort({ workDate: -1, checkInAt: -1, _id: -1 }).skip(skip).limit(limit));
}
function count(query) { return AttendanceSession.countDocuments(query); }
function replay(actor, requestId, session = null) { return AuditLog.findOne({ actor, requestId }).session(session); }
function history(entityId, { skip, limit }) {
  return AuditLog.find({ entityType: 'attendance', entityId }).select('-response -fingerprint')
    .populate('actor', 'displayName username').sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit);
}
function historyCount(entityId) { return AuditLog.countDocuments({ entityType: 'attendance', entityId }); }

module.exports = {
  lockEmployee, markScan, findSession, openSession, sessionsForDay, assignmentUsed, create, save,
  overlap, detail, list, count, replay, history, historyCount, completedForWeek, employeeJob
};
