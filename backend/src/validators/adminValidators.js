const mongoose = require('mongoose');
const { STAFF_ROLES } = require('../constants/roles');
const ApiError = require('../utils/ApiError');

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,50}$/;
const PHONE_PATTERN = /^(?:\+84|0)[0-9]{9,10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireText(value, label, maxLength = 120) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, `${label} là bắt buộc.`);
  }
  if (value.trim().length > maxLength) {
    throw new ApiError(400, `${label} không được vượt quá ${maxLength} ký tự.`);
  }
  return value.trim();
}

function validateEmployeePayload(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.fullName !== undefined) {
    data.fullName = requireText(body.fullName, 'Họ tên');
  }

  for (const [field, label, maxLength] of [
    ['phone', 'Số điện thoại', 20],
    ['email', 'Email', 160],
    ['hometown', 'Quê quán', 200]
  ]) {
    if (body[field] !== undefined) {
      data[field] = String(body[field]).trim();
      if (data[field].length > maxLength) {
        throw new ApiError(400, `${label} không được vượt quá ${maxLength} ký tự.`);
      }
    }
  }

  if (data.phone && !PHONE_PATTERN.test(data.phone.replace(/[\s.-]/g, ''))) {
    throw new ApiError(400, 'Số điện thoại không đúng định dạng Việt Nam.');
  }
  if (data.email && !EMAIL_PATTERN.test(data.email)) {
    throw new ApiError(400, 'Email không đúng định dạng.');
  }

  if (body.gender !== undefined) {
    if (!['Nam', 'Nữ', 'Khác', ''].includes(body.gender)) {
      throw new ApiError(400, 'Giới tính không hợp lệ.');
    }
    data.gender = body.gender;
  }

  if (body.birthDate !== undefined) {
    if (!body.birthDate) {
      data.birthDate = null;
    } else {
      const birthDate = new Date(body.birthDate);
      if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
        throw new ApiError(400, 'Ngày sinh không hợp lệ.');
      }
      data.birthDate = birthDate;
    }
  }

  for (const [field, label] of [
    ['hireDate', 'Ngày vào làm'],
    ['terminationDate', 'Ngày nghỉ việc']
  ]) {
    if (body[field] !== undefined) {
      if (!body[field]) {
        data[field] = null;
      } else {
        const value = new Date(body[field]);
        if (Number.isNaN(value.getTime())) throw new ApiError(400, `${label} không hợp lệ.`);
        data[field] = value;
      }
    }
  }

  if (data.hireDate && data.terminationDate && data.terminationDate < data.hireDate) {
    throw new ApiError(400, 'Ngày nghỉ việc không được trước ngày vào làm.');
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') throw new ApiError(400, 'Trạng thái nhân viên không hợp lệ.');
    data.isActive = body.isActive;
    if (body.isActive && body.terminationDate === undefined) data.terminationDate = null;
  }

  return data;
}

function validateAccountPayload(body) {
  const username = requireText(body.username, 'Tên đăng nhập', 50).toLowerCase();
  if (!USERNAME_PATTERN.test(username)) {
    throw new ApiError(400, 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm, gạch ngang hoặc gạch dưới.');
  }
  if (typeof body.password !== 'string' || body.password.length < 8) {
    throw new ApiError(400, 'Mật khẩu phải có ít nhất 8 ký tự.');
  }
  if (!STAFF_ROLES.includes(body.role)) {
    throw new ApiError(400, 'Vai trò không hợp lệ.');
  }
  if (!mongoose.isValidObjectId(body.employeeId)) {
    throw new ApiError(400, 'Mã nhân viên không hợp lệ.');
  }

  return { username, password: body.password, role: body.role, employeeId: body.employeeId };
}

function validateAccountUpdate(body) {
  const data = {};
  if (body.role !== undefined) {
    if (!STAFF_ROLES.includes(body.role)) throw new ApiError(400, 'Vai trò không hợp lệ.');
    data.role = body.role;
  }
  if (body.displayName !== undefined) {
    data.displayName = requireText(body.displayName, 'Tên hiển thị', 120);
  }
  if (Object.keys(data).length === 0) throw new ApiError(400, 'Không có dữ liệu tài khoản cần cập nhật.');
  return data;
}

function validatePasswordReset(body) {
  if (typeof body.password !== 'string' || body.password.length < 8) {
    throw new ApiError(400, 'Mật khẩu mới phải có ít nhất 8 ký tự.');
  }
  return body.password;
}

module.exports = {
  validateEmployeePayload,
  validateAccountPayload,
  validateAccountUpdate,
  validatePasswordReset
};
