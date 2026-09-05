const employeeRepository = require('../repositories/employee.repository');
const userRepository = require('../repositories/user.repository');
const databaseRepository = require('../repositories/database.repository');
const ApiError = require('../utils/ApiError');
const { escapeRegex } = require('../utils/text');
const { validateEmployeePayload } = require('../validators/adminValidators');
const { recordAudit } = require('./auditService');
const { pagination, paginationResult } = require('../utils/adminQuery');

async function listEmployees(query) {
  const { page, limit, skip } = pagination(query);
  const filters = [];

  if (query.status === 'inactive') filters.push({ isActive: false });
  else if (query.status !== 'all') filters.push({ isActive: true });

  if (query.search?.trim()) {
    const search = new RegExp(escapeRegex(query.search.trim()), 'i');
    filters.push({
      $or: [
        { employeeCode: search },
        { fullName: search },
        { phone: search },
        { email: search }
      ]
    });
  }

  if (query.withoutAccount === 'true') {
    filters.push({ $or: [{ account: { $exists: false } }, { account: null }] });
  }

  const employeeQuery = filters.length ? { $and: filters } : {};
  const [items, total] = await Promise.all([
    employeeRepository.findMany(employeeQuery, { skip, limit }),
    employeeRepository.count(employeeQuery)
  ]);

  return { items, pagination: paginationResult(page, limit, total) };
}

async function getEmployee(id) {
  if (!databaseRepository.isValidObjectId(id)) throw new ApiError(400, 'Mã nhân viên không hợp lệ.');
  const employee = await employeeRepository.findByIdWithAccount(id);
  if (!employee) throw new ApiError(404, 'Không tìm thấy nhân viên.');
  return employee;
}

async function createEmployee(body, context) {
  const payload = validateEmployeePayload(body);
  let employee;
  await databaseRepository.transaction(async (session) => {
    employee = await employeeRepository.create(payload, session);
    await recordAudit(context, {
      action: 'employee.create',
      entityType: 'employee',
      entityId: employee._id,
      before: null,
      after: employee
    }, session);
  });
  return employee;
}

async function updateEmployee(id, currentUserId, body, context) {
  if (!databaseRepository.isValidObjectId(id)) throw new ApiError(400, 'Mã nhân viên không hợp lệ.');
  const payload = validateEmployeePayload(body, { partial: true });
  if (Object.keys(payload).length === 0) throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');

  let employee;
  await databaseRepository.transaction(async (session) => {
    employee = await employeeRepository.findById(id, session);
    if (!employee) throw new ApiError(404, 'Không tìm thấy nhân viên.');
    if (payload.isActive === false && employee.account?.toString() === currentUserId.toString()) {
      throw new ApiError(400, 'Bạn không thể tự cho nghỉ việc hồ sơ của chính mình.');
    }
    const before = employee.toObject();

    employee.set(payload);
    await employeeRepository.save(employee, { session });
    if (payload.isActive === false && employee.account) {
      await userRepository.updateOne(
        { _id: employee.account },
        { $set: { isActive: false }, $inc: { tokenVersion: 1 } },
        { session }
      );
    }

    await recordAudit(context, {
      action: 'employee.update',
      entityType: 'employee',
      entityId: employee._id,
      before,
      after: employee
    }, session);
  });
  await employeeRepository.populateAccount(employee, 'username role isActive');
  return employee;
}

async function deleteEmployee(id, currentUserId, context) {
  if (!databaseRepository.isValidObjectId(id)) throw new ApiError(400, 'Mã nhân viên không hợp lệ.');
  await databaseRepository.transaction(async (session) => {
    const employee = await employeeRepository.findById(id, session);
    if (!employee) throw new ApiError(404, 'Không tìm thấy nhân viên.');
    if (employee.account?.toString() === currentUserId.toString()) {
      throw new ApiError(400, 'Bạn không thể tự cho nghỉ việc hồ sơ của chính mình.');
    }

    const before = employee.toObject();
    employee.isActive = false;
    employee.terminationDate = employee.terminationDate || new Date();
    await employeeRepository.save(employee, { session });
    if (employee.account) {
      await userRepository.updateOne(
        { _id: employee.account },
        { $set: { isActive: false }, $inc: { tokenVersion: 1 } },
        { session }
      );
    }

    await recordAudit(context, {
      action: 'employee.deactivate',
      entityType: 'employee',
      entityId: employee._id,
      before,
      after: employee
    }, session);
  });
}

module.exports = { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
