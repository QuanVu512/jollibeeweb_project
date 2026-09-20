const { validateEnvironment } = require('../config/env');
const { connectDatabase, disconnectDatabase } = require('../config/database');
const { initializeDatabase } = require('../services/databaseBootstrap');

async function initDatabase() {
  validateEnvironment();
  await connectDatabase();

  const result = await initializeDatabase();
  console.log(`Đã khởi tạo database: ${result.database}`);
  console.log(`Collections: ${result.collections.join(', ')}`);
  console.log(`Vai trò hệ thống: ${result.roles.join(', ')}`);
  console.log(`Danh mục thực đơn: ${result.categoryCount}`);
}

initDatabase()
  .catch((error) => {
    console.error('Không thể khởi tạo database:', error.message);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
