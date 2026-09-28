const ApiError = require('../utils/ApiError');
const { validateProfile } = require('../controllers/customerProfile.controller');

function validateRegistration(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Thông tin đăng ký không hợp lệ.');
  if (typeof body.username !== 'string' || !/^[a-z0-9._-]{3,50}$/i.test(body.username.trim())) {
    throw new ApiError(400, 'Tên đăng nhập phải có 3–50 ký tự: chữ không dấu, số, dấu chấm, gạch dưới hoặc gạch ngang.');
  }
  if (typeof body.password !== 'string' || body.password.trim().length < 8 || Buffer.byteLength(body.password, 'utf8') > 72) {
    throw new ApiError(400, 'Mật khẩu cần ít nhất 8 ký tự không tính khoảng trắng đầu cuối và tối đa 72 byte UTF-8.');
  }
  if (typeof body.displayName !== 'string' || !body.displayName.trim()) throw new ApiError(400, 'Vui lòng nhập họ tên.');
  const profile = { fullName: body.displayName };
  for (const field of ['phone', 'email', 'address', 'gender', 'birthDate']) {
    if (Object.hasOwn(body, field)) profile[field] = body[field];
  }
  return { username: body.username.trim().toLowerCase(), password: body.password, profile: validateProfile(profile) };
}
module.exports = { validateRegistration };
