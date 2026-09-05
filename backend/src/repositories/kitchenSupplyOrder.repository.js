const KitchenSupplyOrder = require('../models/KitchenSupplyOrder');

function findAll() {
  return KitchenSupplyOrder.find({}).sort({ createdAt: -1 }).lean();
}

function create(data) {
  return KitchenSupplyOrder.create(data);
}

function findById(id) {
  return KitchenSupplyOrder.findById(id);
}

function save(order) {
  return order.save();
}

module.exports = { findAll, create, findById, save };
