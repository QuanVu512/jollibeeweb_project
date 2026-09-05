const Customer = require('../models/Customer');

function count(filter) {
  return Customer.countDocuments(filter);
}

function createDocument(data) {
  return new Customer(data);
}

function save(customer, options = {}) {
  return customer.save(options);
}

module.exports = { count, createDocument, save };
