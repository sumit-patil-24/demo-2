const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../db');
const { HttpError, asyncHandler } = require('../middleware/errors');
const S = require('../utils/serialize');

const sign = (u) => jwt.sign({ role: u.role }, config.jwtSecret, { subject: u.id, expiresIn: config.jwtExpiresIn });

// Response shape matches the frontend: { token, user: { name, email, role } }
const session = (u) => ({ token: sign(u), user: S.user(u) });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new HttpError(409, 'An account with this email already exists.');
  }
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: role === 'owner' ? 'OWNER' : 'CUSTOMER' },
  });
  res.status(201).json(session(user));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw new HttpError(401, 'Incorrect email or password.');
  res.json(session(user));
});

exports.me = (req, res) => res.json({ user: S.user(req.user) });
