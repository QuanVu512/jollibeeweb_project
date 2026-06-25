const fs = require('node:fs');
const path = require('node:path');

function renderKitchenPage() {
  const templatePath = path.resolve(__dirname, '../../public/kitchen.html');
  return fs.readFileSync(templatePath, 'utf8');
}

module.exports = { renderKitchenPage };
