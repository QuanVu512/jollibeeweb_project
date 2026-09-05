const InventoryTransaction = require('../models/InventoryTransaction');

function create(data, session) {
  return InventoryTransaction.create([data], { session });
}

module.exports = { create };
