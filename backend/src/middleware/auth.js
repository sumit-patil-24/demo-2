const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../db');
const { HttpError, asyncHandler } = require('./errors');

function bearer(req) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' && token ? token : null;
}

function verify(token) {
  try { return jwt.verify(token, config.jwtSecret); } catch { return null; }
}

// 401 unless a valid token for an existing user is supplied.
const requireAuth = asyncHandler(async (req, res, next) => {
  const token = bearer(req);
  if (!token) throw new HttpError(401, 'Please log in to continue.');
  const payload = verify(token);
  const user = payload && (await prisma.user.findUnique({ where: { id: payload.sub } }));
  if (!user) throw new HttpError(401, 'Your session has expired. Please log in again.');
  req.user = user;
  next();
});

// Attaches req.user when a valid token is present; never rejects.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = bearer(req);
  const payload = token && verify(token);
  req.user = payload ? await prisma.user.findUnique({ where: { id: payload.sub } }) : null;
  next();
});

// Roles are Prisma enum values: 'CUSTOMER' | 'OWNER' | 'ADMIN'. Use after requireAuth.
const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new HttpError(403, 'You do not have permission to do that.'));

module.exports = { requireAuth, optionalAuth, requireRole };
