const { connectDatabase, disconnectDatabase } = require('../config/database');
const { validateEnvironment } = require('../config/env');
const { ROLES } = require('../constants/roles');
const User = require('../models/User');

const USERNAME_PATTERN = /^(?=.*[A-Za-z])[A-Za-z0-9]{6,30}$/;
const PASSWORD_PATTERN = /^[\x21-\x7E]{8,30}$/;

async function seedAdmin() {
  validateEnvironment();
  const username = process.env.ADMIN_USERNAME?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || 'Quản trị viên';

  if (!username || !password) {
    throw new Error('Cần khai báo ADMIN_USERNAME và ADMIN_PASSWORD trong file .env.');
  }
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error('ADMIN_USERNAME phải dài từ 6 đến 30 ký tự, chỉ gồm chữ không dấu và số, đồng thời phải có ít nhất một chữ cái.');
  }
  if (!PASSWORD_PATTERN.test(password)) {
    throw new Error('ADMIN_PASSWORD phải dài từ 8 đến 30 ký tự, không chứa dấu tiếng Việt hoặc khoảng trắng.');
  }

  await connectDatabase();
  const existingAccount = await User.findOne({ username });
  const forceReset = process.env.ADMIN_FORCE_RESET === 'true';

  if (existingAccount && !forceReset) {
    console.log(`Tài khoản admin "${username}" đã tồn tại; không thay đổi mật khẩu.`);
    console.log('Muốn đặt lại, đổi ADMIN_FORCE_RESET=true rồi chạy lại một lần.');
    return;
  }

  const passwordHash = await User.hashPassword(password);
  const account = await User.findOneAndUpdate(
    { username },
    { username, passwordHash, displayName, role: ROLES.ADMIN, isActive: true },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  console.log(`${existingAccount ? 'Đã đặt lại' : 'Đã tạo'} tài khoản admin: ${account.username}`);
}

seedAdmin()
  .catch((error) => {
    console.error('Không thể tạo admin:', error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
