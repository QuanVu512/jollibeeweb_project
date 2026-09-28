const employeeService = require('../services/employeeService');
const auditContext = require('../utils/auditContext');

async function listEmployees(req, res) {
  const data = await employeeService.listEmployees(req.query);
  res.json({ success: true, data });
}

async function getEmployee(req, res) {
  const employee = await employeeService.getEmployee(req.params.id);
  res.json({ success: true, data: { employee } });
}

async function createEmployee(req, res) {
  const employee = await employeeService.createEmployee(req.body, auditContext(req));
  res.status(201).json({ success: true, message: 'Đã thêm hồ sơ nhân viên.', data: { employee } });
}

async function updateEmployee(req, res) {
  const employee = await employeeService.updateEmployee(
    req.params.id,
    req.user._id,
    req.body,
    auditContext(req)
  );
  res.json({ success: true, message: 'Đã cập nhật hồ sơ nhân viên.', data: { employee } });
}

async function deleteEmployee(req, res) {
  await employeeService.deleteEmployee(req.params.id, req.user._id, auditContext(req));
  res.json({ success: true, message: 'Đã cho nhân viên nghỉ việc và khóa tài khoản liên kết; lịch sử được giữ lại.' });
}

module.exports = { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee };
