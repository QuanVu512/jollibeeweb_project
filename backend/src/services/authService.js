const jwt = require('jsonwebtoken');

const { config } = require('../config/env');
const { getRoleLandingPage } = require('../constants/roleLandingPages');
const userRepository = require('../repositories/user.repository');
const customerRepository = require('../repositories/customer.repository');
const ApiError = require('../utils/ApiError');
const { recordAudit } = require('./auditService');

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    displayName: user.employee?.fullName || user.displayName || user.username,
    role: user.role
  };
}

function authenticationResponse(user) {
  return {
    user: publicUser(user),
    redirectTo: getRoleLandingPage(user.role)
  };
}

async function authenticateToken(token) {
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, {
      issuer: 'jollibee-admin-api',
      audience: 'jollibee-admin'
    });
  } catch (_error) {
    throw new ApiError(401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
  }

  const user = await userRepository.findForAuthentication(payload.sub);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Tài khoản không tồn tại hoặc đã bị khóa.');
  }
  if (payload.version !== (user.tokenVersion || 0)) {
    throw new ApiError(401, 'Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.');
  }

  return user;
}

async function resolveLogoutUser(token) {
  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: 'jollibee-admin-api',
      audience: 'jollibee-admin',
      ignoreExpiration: true
    });
    const user = await userRepository.findForLogout(payload.sub);
    return user && user.isActive ? user : null;
  } catch (_error) {
    return null;
  }
}

async function login(body, context) {
  const username = typeof body.username === 'string'
    ? body.username.trim().toLowerCase()
    : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password) {
    throw new ApiError(400, 'Vui lòng nhập tên đăng nhập và mật khẩu.');
  }

  const user = await userRepository.findForLogin(username);

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Tên đăng nhập hoặc mật khẩu không chính xác.');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Tài khoản đã bị khóa.');
  }

  const token = jwt.sign({
    sub: user._id.toString(),
    role: user.role,
    version: user.tokenVersion || 0
  }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    issuer: 'jollibee-admin-api',
    audience: 'jollibee-admin'
  });

  user.lastLoginAt = new Date();
  await userRepository.save(user);
  await recordAudit(context, {
    actor: user._id,
    action: 'user.login',
    entityType: 'user',
    entityId: user._id,
    before: null,
    after: { lastLoginAt: user.lastLoginAt }
  });

  return { token, data: authenticationResponse(user) };
}

async function me(userId) {
  const user = await userRepository.findCurrentUser(userId);
  return authenticationResponse(user);
}

async function logout(userId, context) {
  if (userId) {
    await recordAudit(context, {
      action: 'user.logout',
      entityType: 'user',
      entityId: userId,
      before: null,
      after: null
    });
    await userRepository.updateOne({ _id: userId }, { $inc: { tokenVersion: 1 } });
  }
}

async function register(body) {
  console.log('=== 1. DỮ LIỆU FRONTEND GỬI LÊN ===');
  console.log(body);

  const { displayName, username, password, email, address, gender, birthDate } = body;

  if (!username || !password || !displayName) {
    console.log('-> Bị chặn vì thiếu họ tên, tài khoản hoặc mật khẩu');
    return { statusCode: 400, message: 'Vui lòng nhập đủ họ tên, tài khoản và mật khẩu.' };
  }

  const cleanUsername = username.trim().toLowerCase();

  const existingUser = await userRepository.findByUsername(cleanUsername);
  if (existingUser) {
    return { statusCode: 409, message: 'Tên đăng nhập hoặc số điện thoại này đã tồn tại!' };
  }

  const passwordHash = await userRepository.hashPassword(password);

  const customerData = {
    fullName: displayName,
    phone: cleanUsername
  };

  if (email && email.trim() !== '') customerData.email = email.trim();
  if (address && address.trim() !== '') customerData.address = address.trim();
  if (gender && gender.trim() !== '') customerData.gender = gender;
  if (birthDate && birthDate.trim() !== '') customerData.birthDate = birthDate;

  console.log('=== 2. CHUẨN BỊ LƯU VÀO BẢNG CUSTOMER ===');
  console.log(customerData);

  const newCustomer = customerRepository.createDocument(customerData);
  await customerRepository.save(newCustomer);

  const newUser = userRepository.createDocument({
    username: cleanUsername,
    passwordHash,
    role: 'customer',
    displayName,
    customer: newCustomer._id,
    isActive: true,
    tokenVersion: 0
  });
  await userRepository.save(newUser);

  newCustomer.account = newUser._id;
  await customerRepository.save(newCustomer);

  console.log('-> ĐĂNG KÝ THÀNH CÔNG!');
  return {
    statusCode: 201,
    message: 'Đăng ký tài khoản thành công!',
    data: { username: newUser.username, displayName: newUser.displayName }
  };
}

module.exports = { authenticateToken, resolveLogoutUser, login, me, logout, register };
