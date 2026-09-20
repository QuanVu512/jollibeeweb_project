const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
      match: /^[a-z0-9._-]+$/
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
      default: ROLES.CASHIER
    },
    displayName: { type: String, trim: true, maxlength: 120 },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      unique: true,
      sparse: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      unique: true,
      sparse: true
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0, min: 0, select: false },
    revokedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ role: 1, revokedAt: 1, createdAt: -1 });
userSchema.index({ lastLoginAt: -1 });

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.statics.hashPassword = function hashPassword(password) {
  return bcrypt.hash(password, 12);
};

userSchema.set('toJSON', {
  transform: (_document, result) => {
    delete result.passwordHash;
    delete result.tokenVersion;
    delete result.__v;
    return result;
  }
});

module.exports = mongoose.model('User', userSchema);
