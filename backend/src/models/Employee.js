const mongoose = require('mongoose');
const Counter = require('./Counter');

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, unique: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    birthDate: { type: Date, default: null },
    gender: {
      type: String,
      enum: ['Nam', 'Nữ', 'Khác', ''],
      default: ''
    },
    email: { type: String, trim: true, lowercase: true, maxlength: 160, default: '' },
    hometown: { type: String, trim: true, maxlength: 200, default: '' },
    hireDate: { type: Date, default: Date.now },
    terminationDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
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
    return result;
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
