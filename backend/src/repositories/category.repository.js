const Category = require('../models/Category');

function findActive() {
  return Category.find({ isActive: true })
    .select('_id code name sortOrder isActive')
    .sort({ sortOrder: 1, name: 1 })
    .lean();
}

function findActiveById(id, session = null) {
  const query = Category.findOne({ _id: id, isActive: true });
  return session ? query.session(session) : query;
}

module.exports = { findActive, findActiveById };
