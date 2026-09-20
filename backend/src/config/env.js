const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const requiredVariables = ['MONGODB_URI', 'JWT_SECRET'];

function validateEnvironment() {
  const missingVariables = requiredVariables.filter((name) => !process.env[name]);

  if (missingVariables.length > 0) {
    throw new Error(`Thiếu biến môi trường: ${missingVariables.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET phải có ít nhất 32 ký tự.');
  }
}

module.exports = {
  validateEnvironment,
  config: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    cookieName: process.env.COOKIE_NAME || 'jollibee_admin_token',
    cookieMaxAgeMs: Number(process.env.COOKIE_MAX_AGE_MS) || 60 * 60 * 1000
  }
};
