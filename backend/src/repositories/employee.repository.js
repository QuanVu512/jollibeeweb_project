const Employee = require('../models/Employee');

function findMany(query, { skip, limit }) {
  return Employee.find(query)
    .populate('account', 'username role isActive')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

function count(query) {
  return Employee.countDocuments(query);
}

function findByIdWithAccount(id) {
  return Employee.findById(id).populate('account', 'username role isActive');
}

function findById(id, session) {
  return Employee.findById(id).session(session);
}

async function create(payload, session) {
  const [employee] = await Employee.create([payload], { session });
  return employee;
}

function save(employee, options = {}) {
  return employee.save(options);
}

function populateAccount(employee, fields) {
  return employee.populate('account', fields);
}

function detachAccount(accountId, session) {
  return Employee.updateOne({ account: accountId }, { $unset: { account: 1 } }, { session });
}

module.exports = {
  findMany,
  count,
  findByIdWithAccount,
  findById,
  create,
  save,
  populateAccount,
  detachAccount
};
