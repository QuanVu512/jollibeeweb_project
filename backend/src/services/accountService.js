const userRepository = require('../repositories/user.repository');
const employeeRepository = require('../repositories/employee.repository');
const databaseRepository = require('../repositories/database.repository');
const ApiError = require('../utils/ApiError');
const {
  validateAccountPayload,
  validateAccountUpdate,
  validatePasswordReset
} = require('../validators/adminValidators');
const { ROLES, STAFF_ROLES } = require('../constants/roles');
const { escapeRegex } = require('../utils/text');
const { recordAudit } = require('./auditService');
const { pagination, paginationResult } = require('../utils/adminQuery');

async function listAccounts(query) {
  const { page, limit, skip } = pagination(query, { defaultLimit: 100 });
  const filter = { role: { $ne: ROLES.CUSTOMER } };
  if (query.includeRevoked !== 'true') filter.revokedAt = null;
  if (query.role) {
    if (!STAFF_ROLES.includes(query.role)) throw new ApiError(400, 'Vai trò lọc không hợp lệ.');
    filter.role = query.role;
  }
  if (query.status === 'active') filter.isActive = true;
  if (query.status === 'locked') filter.isActive = false;
  if (query.search?.trim()) {
    const search = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.$or = [{ username: search }, { displayName: search }];
  }

  const [items, total] = await Promise.all([
    userRepository.findStaffAccounts(filter, { skip, limit }),
    userRepository.count(filter)
  ]);
  return { items, pagination: paginationResult(page, limit, total) };
}

async function getAccount(id) {
  if (!databaseRepository.isValidObjectId(id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  const account = await userRepository.findStaffAccountById(id);
  if (!account) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
  return account;
}

async function createAccount(body, context) {
  const { username, password, role, employeeId } = validateAccountPayload(body);
  const passwordHash = await userRepository.hashPassword(password);
  let account;
  await databaseRepository.transaction(async (session) => {
    const employee = await employeeRepository.findById(employeeId, session);
    if (!employee) throw new ApiError(404, 'Không tìm thấy nhân viên.');
    if (!employee.isActive) throw new ApiError(409, 'Không thể cấp tài khoản cho nhân viên đã nghỉ việc.');
    if (employee.account) throw new ApiError(409, 'Nhân viên này đã có tài khoản.');

    const existingAccount = await userRepository.existsByUsername(username, session);
    if (existingAccount) throw new ApiError(409, 'Tên đăng nhập đã tồn tại.');

    account = await userRepository.create({
      username,
      passwordHash,
      role,
      displayName: employee.fullName,
      employee: employee._id
    }, session);

    employee.account = account._id;
    await employeeRepository.save(employee, { session });
    await recordAudit(context, {
      action: 'user.create',
      entityType: 'user',
      entityId: account._id,
      before: null,
      after: account
    }, session);
  });

  await userRepository.populateEmployee(account, 'employeeCode fullName');
  return account;
}

async function updateAccount(id, currentUserId, body, context) {
  if (!databaseRepository.isValidObjectId(id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  const payload = validateAccountUpdate(body);
  if (id === currentUserId.toString() && payload.role && payload.role !== ROLES.ADMIN) {
    throw new ApiError(400, 'Bạn không thể tự bỏ quyền quản trị của chính mình.');
  }

  let account;
  await databaseRepository.transaction(async (session) => {
    account = await userRepository.findByIdForMutation(id, session);
    if (!account || account.role === ROLES.CUSTOMER) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
    if (account.revokedAt) throw new ApiError(409, 'Tài khoản này đã bị thu hồi.');
    const before = account.toObject();
    account.set(payload);
    await userRepository.save(account, { session });
    await recordAudit(context, {
      action: 'user.update',
      entityType: 'user',
      entityId: account._id,
      before,
      after: account
    }, session);
  });
  await userRepository.populateEmployee(account, 'employeeCode fullName');
  return account;
}

async function resetAccountPassword(id, body, context) {
  if (!databaseRepository.isValidObjectId(id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  const password = validatePasswordReset(body);
  const passwordHash = await userRepository.hashPassword(password);

  await databaseRepository.transaction(async (session) => {
    const account = await userRepository.findByIdForMutation(id, session);
    if (!account || account.role === ROLES.CUSTOMER) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
    if (account.revokedAt) throw new ApiError(409, 'Tài khoản này đã bị thu hồi.');
    account.passwordHash = passwordHash;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    await userRepository.save(account, { session });
    await recordAudit(context, {
      action: 'user.password_reset',
      entityType: 'user',
      entityId: account._id,
      before: { passwordReset: false },
      after: { passwordReset: true }
    }, session);
  });
}

async function setAccountStatus(id, currentUserId, body, context) {
  if (!databaseRepository.isValidObjectId(id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  if (typeof body.isActive !== 'boolean') throw new ApiError(400, 'Trạng thái tài khoản không hợp lệ.');
  if (id === currentUserId.toString() && !body.isActive) {
    throw new ApiError(400, 'Bạn không thể tự khóa tài khoản của chính mình.');
  }

  let account;
  await databaseRepository.transaction(async (session) => {
    account = await userRepository.findByIdForMutation(id, session);
    if (!account || account.role === ROLES.CUSTOMER) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
    if (account.revokedAt) throw new ApiError(409, 'Tài khoản này đã bị thu hồi.');
    const before = account.toObject();
    account.isActive = body.isActive;
    if (!account.isActive) account.tokenVersion = (account.tokenVersion || 0) + 1;
    await userRepository.save(account, { session });
    await recordAudit(context, {
      action: account.isActive ? 'user.unlock' : 'user.lock',
      entityType: 'user',
      entityId: account._id,
      before,
      after: account
    }, session);
  });

  return account;
}

async function deleteAccount(id, currentUserId, context) {
  if (!databaseRepository.isValidObjectId(id)) throw new ApiError(400, 'Mã tài khoản không hợp lệ.');
  if (id === currentUserId.toString()) {
    throw new ApiError(400, 'Bạn không thể tự thu hồi tài khoản của chính mình.');
  }

  await databaseRepository.transaction(async (session) => {
    const account = await userRepository.findByIdForMutation(id, session);
    if (!account || account.role === ROLES.CUSTOMER) throw new ApiError(404, 'Không tìm thấy tài khoản nhân viên.');
    if (account.revokedAt) throw new ApiError(409, 'Tài khoản này đã bị thu hồi trước đó.');
    const before = account.toObject();

    await employeeRepository.detachAccount(account._id, session);
    account.isActive = false;
    account.tokenVersion = (account.tokenVersion || 0) + 1;
    account.revokedAt = new Date();
    account.employee = undefined;
    await userRepository.save(account, { session });
    await recordAudit(context, {
      action: 'user.revoke',
      entityType: 'user',
      entityId: account._id,
      before,
      after: account
    }, session);
  });
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
