const ApiError = require('../utils/ApiError');
const { isValidObjectId } = require('../repositories/database.repository');
const { validateDate, validateTime } = require('../utils/attendanceTime');

function objectId(value, label = 'Mã tài nguyên') {
  if (typeof value !== 'string' || !/^[a-f\d]{24}$/i.test(value) || !isValidObjectId(value)) {
    throw new ApiError(400, `${label} không hợp lệ.`);
  }
  return value.toLowerCase();
}

function text(value, label, max) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new ApiError(400, `${label} bắt buộc và không vượt quá ${max} ký tự.`);
  }
  return value.trim();
}

function template(body) {
  payloadObject(body);
  const result = {
    name: text(body.name, 'Tên ca', 80),
    startTime: validateTime(body.startTime),
    endTime: validateTime(body.endTime)
  };
  if (result.startTime >= result.endTime) throw new ApiError(400, 'Giờ kết thúc phải sau giờ bắt đầu trong cùng ngày.');
  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') throw new ApiError(400, 'Trạng thái ca không hợp lệ.');
    result.isActive = body.isActive;
  }
  return result;
}

function assignment(body) {
  payloadObject(body);
  return {
    employee: objectId(body.employeeId, 'Mã nhân viên'),
    template: objectId(body.templateId, 'Mã ca mẫu'),
    workDate: validateDate(body.workDate)
  };
}

function requestId(value) {
  if (typeof value !== 'string' || !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(value)) {
    throw new ApiError(400, 'requestId phải là UUID để gửi lại yêu cầu an toàn.');
  }
  return value.toLowerCase();
}

function scan(body) {
  payloadObject(body);
  const employeeCode = text(body.employeeCode, 'Mã nhân viên', 30).toUpperCase();
  if (!/^NV\d{1,12}$/.test(employeeCode)) throw new ApiError(400, 'Mã nhân viên không hợp lệ, ví dụ NV0001.');
  return { employeeCode, requestId: requestId(body.requestId) };
}

function exception(body) {
  const result = { ...scan(body), mode: body.mode, reason: text(body.reason, 'Lý do', 500) };
  if (result.mode === 'SHIFT') result.employeeShiftId = objectId(body.employeeShiftId, 'Mã ca được phân');
  else if (result.mode === 'OT') result.endTime = validateTime(body.endTime);
  else throw new ApiError(400, 'Chọn duyệt ca được phân hoặc OT.');
  return result;
}

function instant(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new ApiError(400, `${label} phải là timestamp có múi giờ.`);
  }
  validateDate(value.slice(0, 10));
  validateTime(value.slice(11, 16));
  const result = new Date(value);
  if (!Number.isFinite(result.getTime()) || (value.slice(17, 19).match(/^\d{2}$/) && Number(value.slice(17, 19)) > 59)) {
    throw new ApiError(400, `${label} không hợp lệ.`);
  }
  return result;
}

function change(body, cancel = false) {
  payloadObject(body);
  const result = { reason: text(body.reason, 'Lý do', 500), revision: body.revision };
  if (!Number.isInteger(result.revision) || result.revision < 0) throw new ApiError(400, 'Thiếu phiên bản bản ghi. Vui lòng tải lại bảng công.');
  if (!cancel) {
    result.checkInAt = instant(body.checkInAt, 'Giờ vào');
    result.checkOutAt = body.checkOutAt === null ? null : instant(body.checkOutAt, 'Giờ ra');
    if (result.checkOutAt && result.checkOutAt <= result.checkInAt) throw new ApiError(400, 'Giờ ra phải sau giờ vào.');
  }
  return result;
}

function filters(query) {
  const result = {};
  if (query.from || query.to || query.workDate) {
    const from = validateDate(query.workDate || query.from || query.to);
    const to = validateDate(query.workDate || query.to || query.from);
    if (from > to) throw new ApiError(400, 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.');
    result.workDate = { $gte: from, $lte: to };
  }
  if (query.employeeId) result.employee = objectId(query.employeeId, 'Mã nhân viên');
  return result;
}

function payloadObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Gửi dữ liệu dưới dạng JSON object.');
}

module.exports = { objectId, text, template, assignment, scan, exception, change, filters, requestId };
