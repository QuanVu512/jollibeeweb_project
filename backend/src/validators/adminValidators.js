const mongoose = require('mongoose');
const { STAFF_ROLES } = require('../constants/roles');
const ApiError = require('../utils/ApiError');

const USERNAME_PATTERN = /^(?=.*[A-Za-z])[A-Za-z0-9]{6,30}$/;
const PASSWORD_PATTERN = /^[\x21-\x7E]{8,30}$/;
const EMPLOYEE_NAME_PATTERN = /^[\p{L}\p{M}]+(?: +[\p{L}\p{M}]+)*$/u;
const PHONE_PATTERN = /^0(?:3|5|7|8|9)\d{8}$/;
const EMAIL_PATTERN = /^[A-Z0-9_%+-]+(?:\.[A-Z0-9_%+-]+)*@(gmail\.com|outlook\.com|hotmail\.com|yahoo\.com|icloud\.com)$/i;

function fieldError(field, message, statusCode = 400) {
  throw new ApiError(statusCode, message, { [field]: message });
}

function lowerFirst(value) {
  return value.charAt(0).toLocaleLowerCase('vi-VN') + value.slice(1);
}

function requireText(value, label, maxLength = 120, field = '') {
  if (typeof value !== 'string' || !value.trim()) {
    fieldError(field, `Nhập ${lowerFirst(label)}.`);
  }
  if (value.trim().length > maxLength) {
    fieldError(field, `${label} không được vượt quá ${maxLength} ký tự.`);
  }
  return value.trim();
}

function validatePassword(password, label = 'Mật khẩu') {
  if (typeof password !== 'string' || !password) fieldError('password', `Nhập ${lowerFirst(label)}.`);
  if (password.length < 8) fieldError('password', `${label} phải có ít nhất 8 ký tự.`);
  if (password.length > 30) fieldError('password', `${label} không được vượt quá 30 ký tự.`);
  if (!PASSWORD_PATTERN.test(password)) fieldError('password', `${label} không được chứa dấu tiếng Việt hoặc khoảng trắng.`);
  return password;
}

function parseDateOnly(value, field, label) {
  const match = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) fieldError(field, `${label} không đúng định dạng.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    fieldError(field, `${label} không đúng định dạng.`);
  }
  return date;
}

function validateEmployeePayload(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.fullName !== undefined) {
    data.fullName = requireText(body.fullName, 'Họ và tên', 70, 'fullName');
    if (!EMPLOYEE_NAME_PATTERN.test(data.fullName)) {
      fieldError('fullName', 'Họ và tên chỉ được gồm chữ và khoảng trắng.');
    }
  }

  if (!partial || body.phone !== undefined) {
    data.phone = requireText(body.phone, 'Số điện thoại', 10, 'phone');
    if (!PHONE_PATTERN.test(data.phone)) {
      fieldError('phone', 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09.');
    }
  }

  if (!partial || body.email !== undefined) {
    data.email = requireText(body.email, 'Email', 70, 'email').toLowerCase();
    if (!EMAIL_PATTERN.test(data.email)) {
      fieldError('email', 'Email phải đúng định dạng và sử dụng tên miền gmail.com, outlook.com, hotmail.com, yahoo.com hoặc icloud.com.');
    }
  }

  if (!partial || body.hometown !== undefined) {
    data.hometown = requireText(body.hometown, 'Quê quán', 30, 'hometown');
  }

  if (!partial || body.gender !== undefined) {
    if (!['Nam', 'Nữ', 'Khác'].includes(body.gender)) {
      fieldError('gender', 'Chọn giới tính.');
    }
    data.gender = body.gender;
  }

  if (!partial || body.birthDate !== undefined) {
    if (!body.birthDate) {
      fieldError('birthDate', 'Chọn ngày sinh.');
    } else {
      const birthDate = parseDateOnly(body.birthDate, 'birthDate', 'Ngày sinh');
      const today = new Date();
      const minimumBirthDate = new Date(Date.UTC(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate()
      ));
      if (birthDate > minimumBirthDate) {
        fieldError('birthDate', 'Nhân viên phải từ đủ 16 tuổi.');
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
  const username = requireText(body.username, 'Tên đăng nhập', 30, 'username').toLowerCase();
  if (username.length < 6) fieldError('username', 'Tên đăng nhập phải có ít nhất 6 ký tự.');
  if (!/^[A-Za-z0-9]+$/.test(username)) fieldError('username', 'Tên đăng nhập chỉ được gồm chữ không dấu và số.');
  if (!USERNAME_PATTERN.test(username)) fieldError('username', 'Tên đăng nhập phải có ít nhất một chữ cái.');
  const password = validatePassword(body.password);
  const role = body.role === undefined || body.role === '' ? null : body.role;
  if (role !== null && !STAFF_ROLES.includes(role)) {
    fieldError('role', 'Chọn vai trò cho tài khoản.');
  }
  if (!mongoose.isValidObjectId(body.employeeId)) {
    fieldError('employeeId', 'Chọn nhân viên cần cấp tài khoản.');
  }

  return { username, password, role, employeeId: body.employeeId };
}

function validateAccountUpdate(body) {
  const data = {};
  if (body.role !== undefined) {
    const role = body.role === '' ? null : body.role;
    if (role !== null && !STAFF_ROLES.includes(role)) throw new ApiError(400, 'Vai trò không hợp lệ.');
    data.role = role;
  }
  if (body.displayName !== undefined) {
    data.displayName = requireText(body.displayName, 'Tên hiển thị', 70, 'displayName');
    if (!EMPLOYEE_NAME_PATTERN.test(data.displayName)) {
      fieldError('displayName', 'Tên hiển thị chỉ được gồm chữ và khoảng trắng.');
    }
  }
  if (Object.keys(data).length === 0) throw new ApiError(400, 'Không có dữ liệu tài khoản cần cập nhật.');
  return data;
}

function validatePasswordReset(body) {
  return validatePassword(body.password, 'Mật khẩu mới');
}

module.exports = {
  validateEmployeePayload,
  validateAccountPayload,
  validateAccountUpdate,
  validatePasswordReset
};
