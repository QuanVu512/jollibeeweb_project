const { config } = require('../config/env');
const authService = require('../services/authService');
const auditContext = require('../utils/auditContext');

async function login(req, res) {
  const result = await authService.login(req.body, auditContext(req));

  res.cookie(config.cookieName, result.token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: config.cookieMaxAgeMs,
    path: '/'
  });

  res.json({ success: true, data: result.data });
}

async function me(req, res) {
  const data = await authService.me(req.user._id);
  res.json({ success: true, data });
}

async function logout(req, res) {
  await authService.logout(req.user?._id, auditContext(req));

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
  try {
    const result = await authService.register(req.body);
    if (result.statusCode !== 201) {
      return res.status(result.statusCode).json({ success: false, message: result.message });
    }

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.log('=== 🚨 LỖI CRASH Ở BACKEND 🚨 ===');
    console.error(error);
    return res.status(400).json({ success: false, message: error.message || 'Dữ liệu không hợp lệ' });
  }
}

module.exports = { login, me, logout, register };
