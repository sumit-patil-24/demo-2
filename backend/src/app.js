const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const prisma = require('./db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
if (config.env === 'production') app.set('trust proxy', 1); // correct client IPs behind a proxy (rate limits)

app.use(helmet());
app.use(cors({
  origin(origin, cb) {
    // allow same-origin/no-origin requests (curl, health checks) and the configured frontends
    if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
}));
app.use(express.json({ limit: '100kb' }));
if (config.env !== 'test') app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Liveness + DB readiness, used by Docker healthchecks.
const health = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'up', uptime: Math.round(process.uptime()) });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' });
  }
};
app.get('/health', health);
app.get('/api/health', health);

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
