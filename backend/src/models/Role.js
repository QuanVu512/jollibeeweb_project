const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const roleSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, enum: Object.values(ROLES) },
    label: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
