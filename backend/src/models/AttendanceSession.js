const mongoose = require('mongoose');
const { GRACE_MINUTES } = require('../constants/attendance');

const attendanceSessionSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  employeeCode: { type: String, required: true },
  employeeName: { type: String, required: true },
  employeeShift: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployeeShift', default: null },
  workDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  kind: { type: String, enum: ['REGULAR', 'OT'], default: 'REGULAR' },
  state: { type: String, enum: ['OPEN', 'CLOSED', 'CANCELLED'], default: 'OPEN' },
  schedule: {
    name: { type: String, required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    graceMinutes: { type: Number, default: GRACE_MINUTES }
  },
  checkInAt: { type: Date, required: true },
  checkOutAt: { type: Date, default: null },
  checkInRecordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkOutRecordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  inStatus: { type: String, enum: ['ON_TIME', 'LATE'], required: true },
  outStatus: { type: String, enum: ['ON_TIME', 'EARLY_LEAVE', null], default: null },
  lateMinutes: { type: Number, default: 0, min: 0 },
  earlyLeaveMinutes: { type: Number, default: 0, min: 0 },
  approval: {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reason: { type: String, maxlength: 500, default: '' },
    approvedAt: { type: Date, default: null }
  },
  revision: { type: Number, default: 0 },
  cancelledAt: { type: Date, default: null },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  cancellationReason: { type: String, maxlength: 500, default: '' }
}, { timestamps: true });

attendanceSessionSchema.index({ employee: 1, workDate: 1, checkInAt: 1 });
attendanceSessionSchema.index({ workDate: -1, state: 1 });
attendanceSessionSchema.index({ employee: 1 }, {
  unique: true, partialFilterExpression: { state: 'OPEN' }
});
attendanceSessionSchema.index({ employeeShift: 1 }, {
  unique: true, partialFilterExpression: { state: { $in: ['OPEN', 'CLOSED'] }, employeeShift: { $type: 'objectId' } }
});

module.exports = mongoose.model('AttendanceSession', attendanceSessionSchema);
