const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const {
  validateAccountPayload,
  validateAccountUpdate,
  validatePasswordReset
} = require('../validators/adminValidators');
const { ROLES, STAFF_ROLES } = require('../constants/roles');
const { escapeRegex } = require('../utils/text');
const { recordAudit } = require('../services/auditService');
const { pagination, paginationResult } = require('../utils/adminQuery');

async function listAccounts(req, res) {
  const { page, limit, skip } = pagination(req.query, { defaultLimit: 100 });
  const filter = { role: { $ne: ROLES.CUSTOMER } };
  if (req.query.includeRevoked !== 'true') filter.revokedAt = null;
  if (req.query.role) {
    if (!STAFF_ROLES.includes(req.query.role)) throw new ApiError(400, 'Vai trò lọc không hợp lệ.');
    filter.role = req.query.role;
  }
  if (req.query.status === 'active') filter.isActive = true;
  if (req.query.status === 'locked') filter.isActive = false;
  if (req.query.search?.trim()) {
    const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ username: search }, { displayName: search }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
    .select('username role displayName employee isActive lastLoginAt revokedAt createdAt')
    .populate('employee', 'employeeCode fullName')
    .sort({ role: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, data: { items, pagination: paginationResult(page, limit, total) } });
}

async function getAccount(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  const account = await User.findOne({ _id: req.params.id, role: { $ne: ROLES.CUSTOMER } })
    .select('username role displayName employee isActive lastLoginAt revokedAt createdAt updatedAt')
    .populate('employee', 'employeeCode fullName phone email isActive');
  if (!account) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
  res.json({ success: true, data: { account } });
}

async function createAccount(req, res) {
  const { username, password, role, employeeId } = validateAccountPayload(req.body);
  const passwordHash = await User.hashPassword(password);
  let account;
  await mongoose.connection.transaction(async (session) => {
    const employee = await Employee.findById(employeeId).session(session);
    if (!employee) throw new ApiError(404, 'Không tìm thấy nhân viên.');
    if (!employee.isActive) throw new ApiError(409, 'Không thể cấp tài khoản cho nhân viên đã nghỉ việc.');
    if (employee.account) throw new ApiError(409, 'Nhân viên này đã có tài khoản.');

    const existingAccount = await User.exists({ username }).session(session);
    if (existingAccount) throw new ApiError(409, 'Tên đăng nhập đã tồn tại.');

    [account] = await User.create([{
      username,
      passwordHash,
      role,
      displayName: employee.fullName,
      employee: employee._id
    }], { session });

    employee.account = account._id;
    await employee.save({ session });
    await recordAudit(req, {
      action: 'user.create',
      entityType: 'user',
      entityId: account._id,
      before: null,
      after: account
    }, session);
  });

  await account.populate('employee', 'employeeCode fullName');
  res.status(201).json({ success: true, message: 'Đã cấp tài khoản cho nhân viên.', data: { account } });
}

async function updateAccount(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  const payload = validateAccountUpdate(req.body);
  if (req.params.id === req.user._id.toString() && payload.role && payload.role !== ROLES.ADMIN) {
    throw new ApiError(400, 'Bạn không thể tự bỏ quyền quản trị của chính mình.');
  }

  let account;
  await mongoose.connection.transaction(async (session) => {
    account = await User.findById(req.params.id).select('+tokenVersion').session(session);
    if (!account || account.role === ROLES.CUSTOMER) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
    if (account.revokedAt) throw new ApiError(409, 'Tài khoản này đã bị thu hồi.');
    const before = account.toObject();
    account.set(payload);
    await account.save({ session });
    await recordAudit(req, {
      action: 'user.update',
      entityType: 'user',
      entityId: account._id,
      before,
      after: account
    }, session);
  });
  await account.populate('employee', 'employeeCode fullName');
  res.json({ success: true, message: 'Đã cập nhật tài khoản.', data: { account } });
}

async function resetAccountPassword(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  const password = validatePasswordReset(req.body);
  const passwordHash = await User.hashPassword(password);

  let account;
  await mongoose.connection.transaction(async (session) => {
    account = await User.findById(req.params.id).select('+tokenVersion').session(session);
    if (!account || account.role === ROLES.CUSTOMER) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
    if (account.revokedAt) throw new ApiError(409, 'Tài khoản này đã bị thu hồi.');
    account.passwordHash = passwordHash;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    await account.save({ session });
    await recordAudit(req, {
      action: 'user.password_reset',
      entityType: 'user',
      entityId: account._id,
      before: { passwordReset: false },
      after: { passwordReset: true }
    }, session);
  });
  res.json({ success: true, message: 'Đã đặt lại mật khẩu tài khoản.' });
}

async function setAccountStatus(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  if (typeof req.body.isActive !== 'boolean') throw new ApiError(400, 'Trạng thái tài khoản không hợp lệ.');
  if (req.params.id === req.user._id.toString() && !req.body.isActive) {
    throw new ApiError(400, 'Bạn không thể tự khóa tài khoản của chính mình.');
  }

  let account;
  await mongoose.connection.transaction(async (session) => {
    account = await User.findById(req.params.id).select('+tokenVersion').session(session);
    if (!account || account.role === ROLES.CUSTOMER) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
    if (account.revokedAt) throw new ApiError(409, 'Tài khoản này đã bị thu hồi.');
    const before = account.toObject();
    account.isActive = req.body.isActive;
    if (!account.isActive) account.tokenVersion = (account.tokenVersion || 0) + 1;
    await account.save({ session });
    await recordAudit(req, {
      action: account.isActive ? 'user.unlock' : 'user.lock',
      entityType: 'user',
      entityId: account._id,
      before,
      after: account
    }, session);
  });

  res.json({ success: true, message: account.isActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.', data: { account } });
}

async function deleteAccount(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, 'Bạn không thể tự thu hồi tài khoản của chính mình.');
  }

  await mongoose.connection.transaction(async (session) => {
    const account = await User.findById(req.params.id).select('+tokenVersion').session(session);
    if (!account || account.role === ROLES.CUSTOMER) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
    if (account.revokedAt) throw new ApiError(409, 'Tài khoản này đã bị thu hồi trước đó.');
    const before = account.toObject();

    await Employee.updateOne({ account: account._id }, { $unset: { account: 1 } }, { session });
    account.isActive = false;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.revokedAt = new Date();
    account.employee = undefined;
    await account.save({ session });
    await recordAudit(req, {
      action: 'user.revoke',
      entityType: 'user',
      entityId: account._id,
      before,
      after: account
    }, session);
  });
  res.json({ success: true, message: 'Đã thu hồi tài khoản; hồ sơ và lịch sử xử lý đơn vẫn được giữ lại.' });
}

module.exports = {
  listAccounts,
  getAccount,
  createAccount,
  updateAccount,
  resetAccountPassword,
  setAccountStatus,
  deleteAccount
};
