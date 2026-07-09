const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateStockDelta } = require('../src/services/kitchenSupplyOrderService');

test('tính tăng tồn kho theo quy đổi đơn vị đặt hàng', () => {
  const delta = calculateStockDelta(3, { stockQuantityPerOrderUnit: 8 });
  assert.equal(delta, 24);
});

test('mặc định dùng 1 đơn vị kho khi chưa có quy đổi', () => {
  const delta = calculateStockDelta(2, null);
  assert.equal(delta, 2);
});
