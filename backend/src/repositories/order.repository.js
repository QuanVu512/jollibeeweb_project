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

function findManyForDetailedReport(filter) {
  const userFields = 'username role displayName employee customer isActive lastLoginAt revokedAt createdAt updatedAt';
  return Order.find(filter)
    .populate({
      path: 'customer',
      populate: { path: 'account', select: userFields }
    })
    .populate([
      { path: 'createdBy', select: userFields },
      { path: 'acceptedBy', select: userFields },
      { path: 'preparedBy', select: userFields },
      { path: 'inventoryDeductedBy', select: userFields },
      { path: 'assignedShipper', select: userFields },
      { path: 'statusHistory.changedBy', select: userFields }
    ])
    .sort({ orderedAt: -1 })
    .lean();
}

function findOne(filter, { session = null, lean = false } = {}) {
  let query = Order.findOne(filter);
  if (session) query = query.session(session);
  if (lean) query = query.lean();
  return query;
}

function aggregate(pipeline) {
  return Order.aggregate(pipeline);
}

function save(order, options = {}) {
  return order.save(options);
}

module.exports = {
  createDocument,
  findById,
  findByIdWithDetails,
  findOne,
  findMany,
  findManyForDetailedReport,
  aggregate,
  save
};
