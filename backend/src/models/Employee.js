const mongoose = require('mongoose');
const Counter = require('./Counter');

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, unique: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true, maxlength: 70 },
    phone: { type: String, required: true, trim: true, maxlength: 10 },
    birthDate: { type: Date, required: true },
    gender: {
      type: String,
      required: true,
      enum: ['Nam', 'Nữ', 'Khác']
    },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 70 },
    hometown: { type: String, required: true, trim: true, maxlength: 30 },
    hireDate: { type: Date, default: Date.now },
    terminationDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    attendanceRevision: { type: Number, default: 0, select: false },
    lastAttendanceAt: { type: Date, default: null, select: false },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true
    }
  },
  { timestamps: true }
);

employeeSchema.index({ isActive: 1, hireDate: -1 });
employeeSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string', $gt: '' } } }
);
employeeSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string', $gt: '' } } }
);

employeeSchema.pre('validate', async function assignEmployeeCode() {
  if (this.employeeCode) return;

  const counter = await Counter.findByIdAndUpdate(
    'employee',
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  this.employeeCode = `NV${String(counter.sequence).padStart(4, '0')}`;
});

employeeSchema.set('toJSON', {
  transform: (_document, result) => {
    delete result.__v;
    delete result.attendanceRevision;
    delete result.lastAttendanceAt;
    return result;
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
