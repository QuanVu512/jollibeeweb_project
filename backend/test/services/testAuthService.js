const fs = require('node:fs');
const path = require('node:path');

// Re-export / run the root test suite or execute identically
const candidates = [
  path.resolve(__dirname, '../../../test/services/admin/testAuthService.js'),
  path.resolve(__dirname, '../../../../test/services/admin/testAuthService.js'),
  path.resolve(__dirname, '../../../test/services/testAuthService.js'),
  path.resolve(__dirname, '../../../../test/services/testAuthService.js'),
];

const found = candidates.find((p) => fs.existsSync(p));
if (found) {
  require(found);
} else {
  throw new Error('Could not locate testAuthService.js in project test directory.');
}
