const ApiError = require('../utils/ApiError');

const NOTIFICATION_AUDIENCES = Object.freeze(['all_customers', 'active_customers']);
const NOTIFICATION_PRIORITIES = Object.freeze(['normal', 'important']);

function cleanText(value) {
  return String(value || '').trim();
}

function validateNotificationPayload(body = {}) {
  const title = cleanText(body.title);
  const message = cleanText(body.message);
  const audience = cleanText(body.audience) || 'all_customers';
  const priority = cleanText(body.priority) || 'normal';

  if (!title) throw new ApiError(400, 'Vui lòng nhập tiêu đề thông báo.');
  if (title.length > 120) throw new ApiError(400, 'Tiêu đề thông báo tối đa 120 ký tự.');
  if (!message) throw new ApiError(400, 'Vui lòng nhập nội dung thông báo.');
  if (message.length > 1000) throw new ApiError(400, 'Nội dung thông báo tối đa 1000 ký tự.');
  if (!NOTIFICATION_AUDIENCES.includes(audience)) {
    throw new ApiError(400, 'Nhóm khách nhận thông báo không hợp lệ.');
  }
  if (!NOTIFICATION_PRIORITIES.includes(priority)) {
    throw new ApiError(400, 'Mức độ thông báo không hợp lệ.');
  }

  return { title, message, audience, priority };
}

module.exports = {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_PRIORITIES,
  validateNotificationPayload
};
