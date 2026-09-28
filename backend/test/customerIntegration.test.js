const test = require('node:test');
const assert = require('node:assert/strict');
const database = require('../src/repositories/database.repository');
const orders = require('../src/repositories/order.repository');
const products = require('../src/repositories/product.repository');
const inventory = require('../src/services/inventoryRecipeService');
const availability = require('../src/services/productAvailability');
const Customer = require('../src/models/Customer');

test('web orders retain ownership and reserve inventory on every transaction attempt', async t => {
  const session = {};
  let deductions = 0;
  let saved;
  t.mock.method(Customer, 'findOne', async () => ({ _id: 'customer-id' }));
  t.mock.method(products, 'findById', async () => ({ _id: 'product', name: 'Mì', productCode: 'MON1', price: 45000 }));
  t.mock.method(orders, 'findOne', async () => null);
  t.mock.method(orders, 'createDocument', data => ({ ...data, async validate() {} }));
  t.mock.method(orders, 'save', async (order, options) => { assert.equal(options.session, session); saved = order; });
  t.mock.method(availability, 'withAvailability', async () => [{ availableQuantity: 2 }]);
  t.mock.method(inventory, 'checkOrderStockSufficiency', async () => {});
  t.mock.method(inventory, 'deductIngredientsForOrder', async (order, userId, options) => {
    assert.equal(order.inventoryDeductedAt, null);
    assert.equal(userId, 'owner');
    assert.equal(options.session, session);
    assert.equal(options.requireRecipes, true);
    deductions++;
  });
  t.mock.method(database, 'transaction', async callback => { await callback(session); await callback(session); });
  delete require.cache[require.resolve('../src/services/banhangService')];
  const service = require('../src/services/banhangService');
  const result = await service.createOrder({ source: 'web', orderType: 'delivery', checkoutToken: 'token', items: [{ productId: 'product', quantity: 2 }] }, 'owner', { customer: 'customer-id' });
  assert.equal(deductions, 2);
  assert.equal(saved.customer, 'customer-id');
  assert.equal(saved.checkoutToken, 'token');
  assert.equal(result.order.status, 'pending');
  assert.ok(saved.inventoryDeductedAt instanceof Date);
});
