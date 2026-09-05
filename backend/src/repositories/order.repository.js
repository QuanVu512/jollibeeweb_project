const Order = require('../models/Order');

function createDocument(data) {
  return new Order(data);
}

function findById(id, session = null) {
  const query = Order.findById(id);
  return session ? query.session(session) : query;
}

function findByIdWithDetails(id) {
  return Order.findById(id)
    .populate('customer', 'fullName phone address')
    .populate('assignedShipper', 'username displayName role');
}

function findMany(filter, { sort, populate = null, lean = false } = {}) {
  let query = Order.find(filter);
  if (populate) query = query.populate(populate.path, populate.select);
  if (sort) query = query.sort(sort);
  if (lean) query = query.lean();
  return query;
}

function aggregate(pipeline) {
  return Order.aggregate(pipeline);
}

function save(order, options = {}) {
  return order.save(options);
}

module.exports = { createDocument, findById, findByIdWithDetails, findMany, aggregate, save };
