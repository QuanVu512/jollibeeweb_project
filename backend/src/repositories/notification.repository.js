const Notification = require('../models/Notification');

function findMany(filter, { skip, limit }) {
  return Notification.find(filter)
    .populate('createdBy', 'username displayName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

function count(filter) {
  return Notification.countDocuments(filter);
}

function findForCustomer(limit) {
  return Notification.find({ status: 'sent' })
    .select('title message audience priority sentAt createdAt')
    .sort({ priority: 1, sentAt: -1, createdAt: -1 })
    .limit(limit)
    .lean();
}

function create(data) {
  return Notification.create(data);
}

function populateCreator(notification) {
  return notification.populate('createdBy', 'username displayName');
}

module.exports = { findMany, count, findForCustomer, create, populateCreator };
