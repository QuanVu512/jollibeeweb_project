const Product = require('../models/Product');

function findActive() {
  return Product.find({ isActive: true }).sort({ name: 1 });
}

function findMany(query, { skip, limit }) {
  return Product.find(query)
    .populate('category', 'code name isActive')
    .sort({ createdAt: -1, name: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

function count(query) {
  return Product.countDocuments(query);
}

function findById(id, session = null) {
  const query = Product.findById(id);
  return session ? query.session(session) : query;
}

function findByIdWithCategory(id) {
  return Product.findById(id).populate('category', 'code name isActive');
}

async function create(payload, session) {
  const [product] = await Product.create([payload], { session });
  return product;
}

function save(product, options = {}) {
  return product.save(options);
}

module.exports = {
  findActive,
  findMany,
  count,
  findById,
  findByIdWithCategory,
  create,
  save
};
