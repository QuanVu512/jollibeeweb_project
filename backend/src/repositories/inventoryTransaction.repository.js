const InventoryTransaction = require('../models/InventoryTransaction');

function create(data, session) {
  return InventoryTransaction.create([data], { session });
}

function findOrderMovements(orderId, session) {
  return InventoryTransaction.find({ order: orderId, ingredient: { $ne: null }, type: { $in: ['sale', 'adjustment', 'cancel_return'] } }).session(session);
}
module.exports = { create, findOrderMovements };
