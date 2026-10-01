const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function sanitizeEnv(val) {
  if (typeof val !== 'string') return val;
  let trimmed = val.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

const rawMongoUri = sanitizeEnv(process.env.MONGODB_URI);
const rawJwtSecret = sanitizeEnv(process.env.JWT_SECRET);

const requiredVariables = ['MONGODB_URI', 'JWT_SECRET'];

function validateEnvironment() {
  const missing = [];
  if (!rawMongoUri) missing.push('MONGODB_URI');
  if (!rawJwtSecret) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    throw new Error(`Thiếu biến môi trường: ${missing.join(', ')}`);
  }

  if (rawJwtSecret.length < 32) {
    throw new Error('JWT_SECRET phải có ít nhất 32 ký tự.');
  }

  if (!rawMongoUri.startsWith('mongodb://') && !rawMongoUri.startsWith('mongodb+srv://')) {
    throw new Error(`MONGODB_URI không hợp lệ (phải bắt đầu bằng 'mongodb://' hoặc 'mongodb+srv://'). Giá trị hiện tại: '${rawMongoUri.substring(0, 15)}...'`);
  }
}

module.exports = {
  validateEnvironment,
  config: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    mongoUri: rawMongoUri,
    jwtSecret: rawJwtSecret,
    jwtExpiresIn: sanitizeEnv(process.env.JWT_EXPIRES_IN) || '8h',
    cookieName: sanitizeEnv(process.env.COOKIE_NAME) || 'jollibee_admin_token',
    cookieMaxAgeMs: Number(process.env.COOKIE_MAX_AGE_MS) || 60 * 60 * 1000
  }
};
