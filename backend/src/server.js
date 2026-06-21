const http = require('node:http');
const app = require('./app');
const { config, validateEnvironment } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { initializeDatabase } = require('./services/databaseBootstrap');

async function start() {
  validateEnvironment();
  await connectDatabase();
  const database = await initializeDatabase();
  console.log(`Đã kiểm tra ${database.collections.length} collection và ${database.roles.length} vai trò hệ thống.`);

  const server = http.createServer(app);
  server.listen(config.port, () => {
    console.log(`Admin API đang chạy tại http://localhost:${config.port}`);
  });

  async function shutdown(signal) {
    console.log(`\nNhận ${signal}, đang dừng máy chủ...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Không thể khởi động máy chủ:', error.message);
  process.exit(1);
});
