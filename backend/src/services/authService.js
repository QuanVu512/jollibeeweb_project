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
  const mongoose = require('mongoose');
  const { validateRegistration } = require('../validators/registrationValidator');
  const { username, password, profile } = validateRegistration(body);
  if (await userRepository.findByUsername(username)) throw new ApiError(409, 'Tên đăng nhập đã tồn tại.');
  const passwordHash = await userRepository.hashPassword(password);
  try {
    await mongoose.connection.transaction(async session => {
      const customerId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();
      const customer = customerRepository.createDocument({ ...profile, _id: customerId, account: userId });
      const user = userRepository.createDocument({
        _id: userId, username, passwordHash, displayName: profile.fullName,
        customer: customerId, role: 'customer', isActive: true, tokenVersion: 0
      });
      await customerRepository.save(customer, { session });
      await userRepository.save(user, { session });
    });
  } catch (error) {
    if (error.code === 11000 && (error.keyPattern?.username || error.keyValue?.username)) {
      throw new ApiError(409, 'Tên đăng nhập đã tồn tại.');
    }
    throw error;
  }
  return {
    statusCode: 201, message: 'Đăng ký tài khoản thành công!',
    data: { username, displayName: profile.fullName }
  };
}

module.exports = { authenticateToken, resolveLogoutUser, login, me, logout, register };
