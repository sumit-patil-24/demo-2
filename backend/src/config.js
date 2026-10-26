require('dotenv').config();

function required(key) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required environment variable: ${key}`);
  return v;
}

const env = process.env.NODE_ENV || 'development';
const jwtSecret = required('JWT_SECRET');
if (env === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}

module.exports = {
  env,
  port: Number(process.env.PORT) || 5000,
  databaseUrl: required('DATABASE_URL'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',').map((s) => s.trim()).filter(Boolean),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
};
