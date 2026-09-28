const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const Ingredient = require('../src/models/Ingredient');
const Movement = require('../src/models/InventoryTransaction');
const cancel = require('../src/services/cancelPendingOrder');
const { deductIngredientsForOrder } = require('../src/services/inventoryRecipeService');

test('cancellation returns the recorded ingredients once, within the order transaction', async t => {
  const session = {};
  const order = { _id: 'order', orderCode: 'DH1', status: 'pending', inventoryDeductedAt: new Date(), statusHistory: [], async save(options) { assert.equal(options.session, session); } };
  t.mock.method(mongoose.connection, 'transaction', async callback => callback(session));
  t.mock.method(Order, 'findOne', filter => ({ session: async supplied => {
    assert.equal(supplied, session);
    assert.equal(filter.status, 'pending');
    assert.equal(filter.createdBy, 'owner');
    return order.status === 'pending' ? order : null;
  } }));
  t.mock.method(Movement, 'find', () => ({ session: async () => [{ ingredient: 'ing', quantityChange: -2.5 }] }));
  let returns = 0;
  t.mock.method(Ingredient, 'findByIdAndUpdate', async (id, change, options) => {
    assert.equal(id, 'ing');
    assert.equal(change.$inc.stockQuantity, 2.5);
    assert.equal(options.session, session);
    returns++;
    return { _id: id, stockQuantity: 3 };
  });
  t.mock.method(Movement, 'create', async ([entry]) => {
    assert.equal(entry.type, 'cancel_return');
    assert.equal(entry.stockBefore, .5);
  });
  await cancel({ _id: 'order', createdBy: 'owner' }, 'owner', 'Hủy');
  assert.equal(order.status, 'cancelled');
  await assert.rejects(cancel({ _id: 'order', createdBy: 'owner' }, 'owner', 'Hủy'), /không còn/);
  assert.equal(returns, 1);
});
test('confirmation does not deduct inventory already reserved at checkout', async () => {
  const result = await deductIngredientsForOrder({ inventoryDeductedAt: new Date() }, 'owner');
  assert.equal(result.alreadyDeducted, true);
  assert.deepEqual(result.deducted, []);
});
