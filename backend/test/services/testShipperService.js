const fs = require('node:fs');
const path = require('node:path');

// Re-export / run the root test suite
const candidates = [
  path.resolve(__dirname, '../../../test/services/testShipperService.js'),
  path.resolve(__dirname, '../../../../test/services/testShipperService.js')
];

const found = candidates.find((p) => fs.existsSync(p));
if (found) {
  require(found);
} else {
  throw new Error('Could not locate testShipperService.js in test directory.');
}
