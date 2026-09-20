const User = require('../models/User');
const { ROLES } = require('../constants/roles');

function findStaffAccounts(filter, { skip, limit }) {
  return User.find(filter)
    .select('username role displayName employee isActive lastLoginAt revokedAt createdAt')
    .populate('employee', 'employeeCode fullName')
    .sort({ role: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
}

function count(filter) {
  return User.countDocuments(filter);
}

function findStaffAccountById(id) {
  return User.findOne({ _id: id, role: { $ne: ROLES.CUSTOMER } })
    .select('username role displayName employee isActive lastLoginAt revokedAt createdAt updatedAt')
    .populate('employee', 'employeeCode fullName phone email isActive');
}

function findByIdForMutation(id, session) {
  return User.findById(id).select('+tokenVersion').session(session);
}

function existsByUsername(username, session) {
  return User.exists({ username }).session(session);
}

async function create(data, session) {
  const [user] = await User.create([data], { session });
  return user;
}

function save(user, options = {}) {
  return user.save(options);
}

function updateOne(filter, update, options = {}) {
  return User.updateOne(filter, update, options);
}

function populateEmployee(user, fields) {
  return user.populate('employee', fields);
}

function hashPassword(password) {
  return User.hashPassword(password);
}

function findForLogin(username) {
  return User.findOne({ username })
    .select('+passwordHash +tokenVersion username role displayName isActive employee')
    .populate('employee', 'fullName');
}

function findCurrentUser(id) {
  return User.findById(id)
    .select('username role displayName employee')
    .populate('employee', 'fullName');
}

function findByUsername(username) {
  return User.findOne({ username });
}

function createDocument(data) {
  return new User(data);
}

function findForLogout(id) {
  return User.findById(id).select('+tokenVersion _id isActive');
}

function findForAuthentication(id) {
  return User.findById(id)
    .select('+tokenVersion username role displayName isActive employee revokedAt');
}

module.exports = {
  findStaffAccounts,
  count,
  findStaffAccountById,
  findByIdForMutation,
  existsByUsername,
  create,
  save,
  updateOne,
  populateEmployee,
  hashPassword,
  findForLogin,
  findCurrentUser,
  findByUsername,
  createDocument,
  findForLogout,
  findForAuthentication
};
