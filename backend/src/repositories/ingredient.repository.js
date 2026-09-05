const Ingredient = require('../models/Ingredient');

function findAll() {
  return Ingredient.find({}).sort({ createdAt: -1 }).lean();
}

function create(data) {
  return Ingredient.create(data);
}

function findById(id, session = null) {
  const query = Ingredient.findById(id);
  return session ? query.session(session) : query;
}

function findByIds(ids) {
  return Ingredient.find({ _id: { $in: ids } }).select('_id code name');
}

function save(ingredient, options = {}) {
  return ingredient.save(options);
}

function remove(ingredient) {
  return ingredient.deleteOne();
}

function deductStock(deduction, session) {
  return Ingredient.findOneAndUpdate(
    {
      _id: deduction.ingredient,
      isActive: true,
      stockQuantity: { $gte: deduction.quantity }
    },
    { $inc: { stockQuantity: -deduction.quantity } },
    { new: true, runValidators: true, session }
  );
}

module.exports = { findAll, create, findById, findByIds, save, remove, deductStock };
