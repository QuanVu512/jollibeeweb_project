const PurchaseMaterial = require('../models/PurchaseMaterial');

function findActive() {
  return PurchaseMaterial.find({ isActive: true }).sort({ name: 1 }).lean();
}

function findByIngredientIds(ids) {
  return PurchaseMaterial.find({ ingredient: { $in: ids } }).lean();
}

module.exports = { findActive, findByIngredientIds };
