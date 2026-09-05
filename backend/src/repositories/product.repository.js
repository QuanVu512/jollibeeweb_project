const Product = require('../models/Product');

function findActive() {
  return Product.find({ isActive: true }).sort({ name: 1 });
}

function findById(id) {
  return Product.findById(id);
}

module.exports = { findActive, findById };
