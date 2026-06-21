const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { escapeRegex } = require('../utils/text');
const { validateEmployeePayload } = require('../validators/adminValidators');
const { recordAudit } = require('../services/auditService');
const { pagination, paginationResult } = require('../utils/adminQuery');

async function listEmployees(req, res) {
  const { page, limit, skip } = pagination(req.query);
  const filters = [];

  if (req.query.status === 'inactive') filters.push({ isActive: false });
  else if (req.query.status !== 'all') filters.push({ isActive: true });

  if (req.query.search?.trim()) {
    const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filters.push({
      $or: [
        { employeeCode: search },
        { fullName: search },
        { phone: search },
        { email: search }
      ]
    });
  }

  if (req.query.withoutAccount === 'true') {
    filters.push({ $or: [{ account: { $exists: false } }, { account: null }] });
  }

  const query = filters.length ? { $and: filters } : {};
  const [items, total] = await Promise.all([
    Employee.find(query)
      .populate('account', 'username role isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Employee.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: { items, pagination: paginationResult(page, limit, total) }
  });
}

async function getEmployee(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Mã nhân viên không hợp lệ.');
  const employee = await Employee.findById(req.params.id).populate('account', 'username role isActive');
  if (!employee) throw new ApiError(404, 'Không tìm thấy nhân viên.');
  res.json({ success: true, data: { employee } });
}

async function createEmployee(req, res) {
  const payload = validateEmployeePayload(req.body);
  let employee;
  await mongoose.connection.transaction(async (session) => {
    [employee] = await Employee.create([payload], { session });
    await recordAudit(req, {
      action: 'employee.create',
      entityType: 'employee',
      entityId: employee._id,
      before: null,
      after: employee
    }, session);
  });
  res.status(201).json({ success: true, message: 'Đã thêm hồ sơ nhân viên.', data: { employee } });
}

async function updateEmployee(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Mã nhân viên không hợp lệ.');
  const payload = validateEmployeePayload(req.body, { partial: true });
  if (Object.keys(payload).length === 0) throw new ApiError(400, 'Không có dữ liệu cần cập nhật.');

  let employee;
  await mongoose.connection.transaction(async (session) => {
    employee = await Employee.findById(req.params.id).session(session);
    if (!employee) throw new ApiError(404, 'Không tìm thấy nhân viên.');
    if (payload.isActive === false && employee.account?.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'Bạn không thể tự cho nghỉ việc hồ sơ của chính mình.');
    }
    const before = employee.toObject();

    employee.set(payload);
    await employee.save({ session });
    if (payload.isActive === false && employee.account) {
      await User.updateOne(
        { _id: employee.account },
        { $set: { isActive: false }, $inc: { tokenVersion: 1 } },
        { session }
      );
    }

    await recordAudit(req, {
      action: 'employee.update',
      entityType: 'employee',
      entityId: employee._id,
      before,
      after: employee
    }, session);
  });
  await employee.populate('account', 'username role isActive');

  res.json({ success: true, message: 'Đã cập nhật hồ sơ nhân viên.', data: { employee } });
}

async function deleteEmployee(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new ApiError(400, 'Mã nhân viên không hợp lệ.');
  let employee;
  await mongoose.connection.transaction(async (session) => {
    employee = await Employee.findById(req.params.id).session(session);
    if (!employee) throw new ApiError(404, 'Không tìm thấy nhân viên.');
    if (employee.account?.toString() === req.user._id.toString()) {
      throw new ApiError(400, 'Bạn không thể tự cho nghỉ việc hồ sơ của chính mình.');
    }

    const before = employee.toObject();
    employee.isActive = false;
    employee.terminationDate = employee.terminationDate || new Date();
    await employee.save({ session });
    if (employee.account) {
      await User.updateOne(
        { _id: employee.account },
        { $set: { isActive: false }, $inc: { tokenVersion: 1 } },
        { session }
      );
    }

    await recordAudit(req, {
      action: 'employee.deactivate',
      entityType: 'employee',
      entityId: employee._id,
      before,
      after: employee
    }, session);
  });

  res.json({ success: true, message: 'Đã cho nhân viên nghỉ việc và khóa tài khoản liên kết; lịch sử được giữ lại.' });
}

module.exports = { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
