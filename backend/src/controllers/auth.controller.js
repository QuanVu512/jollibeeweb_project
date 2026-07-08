const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const { getRoleLandingPage } = require('../constants/roleLandingPages');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { recordAudit } = require('../services/auditService');
const Customer = require('../models/Customer');

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

async function login(req, res) {
  const username = typeof req.body.username === 'string'
    ? req.body.username.trim().toLowerCase()
    : '';
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!username || !password) {
    throw new ApiError(400, 'Vui lòng nhập tên đăng nhập và mật khẩu.');
  }

  const user = await User.findOne({ username })
    .select('+passwordHash +tokenVersion username role displayName isActive employee')
    .populate('employee', 'fullName');

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
  await user.save();
  await recordAudit(req, {
    actor: user._id,
    action: 'user.login',
    entityType: 'user',
    entityId: user._id,
    before: null,
    after: { lastLoginAt: user.lastLoginAt }
  });

  res.cookie(config.cookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: config.cookieMaxAgeMs,
    path: '/'
  });

  res.json({ success: true, data: authenticationResponse(user) });
}

async function me(req, res) {
  const user = await User.findById(req.user._id)
    .select('username role displayName employee')
    .populate('employee', 'fullName');

  res.json({ success: true, data: authenticationResponse(user) });
}

async function logout(req, res) {
  if (req.user?._id) {
    await recordAudit(req, {
      action: 'user.logout',
      entityType: 'user',
      entityId: req.user._id,
      before: null,
      after: null
    });
    await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  }

  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
    expires: new Date(0)
  });

  const redirectTo = typeof req.query.redirect === 'string' && req.query.redirect.startsWith('/')
    ? req.query.redirect
    : '/admin/login.html';

  if (req.method === 'GET') {
    return res.redirect(redirectTo);
  }

  return res.status(204).send();
}

async function register(req, res) {
  const { displayName, username, password } = req.body;

  if (!username || !password || !displayName) {
    throw new ApiError(400, 'Vui lòng nhập đủ họ tên, tài khoản và mật khẩu.');
  }

  const cleanUsername = username.trim().toLowerCase();

  const existingUser = await User.findOne({ username: cleanUsername });
  if (existingUser) {
    throw new ApiError(409, 'Tên đăng nhập hoặc số điện thoại này đã tồn tại!');
  }

  const passwordHash = await User.hashPassword(password);

  const newCustomer = new Customer({
    fullName: displayName, 
    phone: cleanUsername
  });
  await newCustomer.save();

  const newUser = new User({
    username: cleanUsername,
    passwordHash: passwordHash,
    role: 'customer', 
    displayName: displayName,
    customer: newCustomer._id,
    isActive: true,
    tokenVersion: 0
  });
  await newUser.save();

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: { username: newUser.username, displayName: newUser.displayName }
  });
}

module.exports = { login, me, logout, register };
