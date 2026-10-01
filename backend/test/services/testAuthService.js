const fs = require('node:fs');
const path = require('node:path');

// Re-export / run the root test suite or execute identically
const rootTestFile = path.resolve(__dirname, '../../../../test/services/testAuthService.js');
const altTestFile = path.resolve(__dirname, '../../../test/services/testAuthService.js');

if (fs.existsSync(rootTestFile)) {
  require(rootTestFile);
} else if (fs.existsSync(altTestFile)) {
  require(altTestFile);
} else {
  throw new Error('Could not locate testAuthService.js in project test directory.');
}
