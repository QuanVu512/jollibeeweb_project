const mongoose = require('mongoose');
const { GRACE_MINUTES } = require('../constants/attendance');

const employeeShiftSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: 'ShiftTemplate', required: true },
  workDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  name: { type: String, required: true, maxlength: 80 },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  graceMinutes: { type: Number, default: GRACE_MINUTES, min: 0 },
  isActive: { type: Boolean, default: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

employeeShiftSchema.index({ employee: 1, workDate: 1, startAt: 1 });
employeeShiftSchema.index({ employee: 1, template: 1, workDate: 1 }, {
  unique: true, partialFilterExpression: { isActive: true }
});
module.exports = mongoose.model('EmployeeShift', employeeShiftSchema);
