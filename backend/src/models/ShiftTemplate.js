const mongoose = require('mongoose');

const shiftTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  startTime: { type: String, required: true, match: /^(?:[01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^(?:[01]\d|2[0-3]):[0-5]\d$/ },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

shiftTemplateSchema.pre('validate', function validateHours() {
  if (this.startTime >= this.endTime) this.invalidate('endTime', 'Chỉ hỗ trợ ca kết thúc trong cùng ngày và sau giờ bắt đầu.');
});

module.exports = mongoose.model('ShiftTemplate', shiftTemplateSchema);
