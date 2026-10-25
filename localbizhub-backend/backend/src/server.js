const config = require('./config');
const app = require('./app');
const prisma = require('./db');

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`LocalBizHub API listening on :${config.port} (${config.env})`);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => { await prisma.$disconnect(); process.exit(0); });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
