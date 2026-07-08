const fs = require('node:fs');
const path = require('node:path');

function renderKitchenPage() {
  // Render đúng dashboard "Nhập kho"/"Đơn hàng" như trong bep/kitchen.html
  const templatePath = path.resolve(__dirname, '../../../bep/kitchen.html');
  return fs.readFileSync(templatePath, 'utf8');
}

module.exports = { renderKitchenPage };
