const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');
const fields = ['fullName', 'phone', 'email', 'birthDate', 'gender', 'address'];

function validateProfile(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ApiError(400, 'Thông tin không hợp lệ.');
  const data = {};
  for (const field of fields) {
    if (!Object.hasOwn(body, field)) continue;
    if (typeof body[field] !== 'string') throw new ApiError(400, 'Thông tin không hợp lệ.');
    data[field] = body[field].trim();
  }
  for (const [field, max] of Object.entries({ fullName: 120, phone: 20, email: 160, address: 300 })) {
    if (data[field]?.length > max) throw new ApiError(400, 'Thông tin vượt quá độ dài cho phép.');
  }
  if (data.fullName === '') throw new ApiError(400, 'Vui lòng nhập họ tên.');
  if (data.phone) {
    const digits = data.phone.replace(/[ ()-]/g, '');
    if (!/^\+?\d{8,15}$/.test(digits)) throw new ApiError(400, 'Số điện thoại phải có 8–15 chữ số, có thể bắt đầu bằng dấu +.');
    data.phone = digits;
  }
  if (data.email) data.email = data.email.toLowerCase();
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new ApiError(400, 'Email không hợp lệ.');
  if (data.gender !== undefined && !['', 'male', 'female', 'other'].includes(data.gender)) throw new ApiError(400, 'Giới tính không hợp lệ.');
  if (data.birthDate) {
    const date = new Date(data.birthDate);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.birthDate || date > new Date()) throw new ApiError(400, 'Ngày sinh không hợp lệ.');
  } else if (data.birthDate === '') data.birthDate = null;
  return data;
}
function publicProfile(customer) {
  const profile = Object.fromEntries(fields.map(field => [field, customer[field] ?? '']));
  // Dữ liệu đăng ký cũ từng lưu tên đăng nhập vào trường phone.
  // Không đưa giá trị không phải số điện thoại lên biểu mẫu để khách nhập lại.
  if (profile.phone && !/^\+?[0-9][0-9 ()-]{7,19}$/.test(profile.phone)) profile.phone = '';
  return profile;
}
function profileOwnerFilter(user) {
  const owners = [{ account: user._id }];
  if (user.customer) owners.push({ _id: user.customer });
  return { $or: owners, isActive: true };
}
async function getProfile(req, res) {
  const customer = await Customer.findOne(profileOwnerFilter(req.user));
  if (!customer) throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng.');
  res.json({ success: true, data: { profile: publicProfile(customer) } });
}
async function updateProfile(req, res) {
  const data = validateProfile(req.body);
  const customer = await Customer.findOneAndUpdate(
    profileOwnerFilter(req.user), { $set: data }, { new: true, runValidators: true }
  );
  if (!customer) throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng.');
  res.json({ success: true, data: { profile: publicProfile(customer) } });
}
module.exports = { getProfile, updateProfile, validateProfile };
