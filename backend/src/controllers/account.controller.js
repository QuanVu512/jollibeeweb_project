const accountService = require('../services/accountService');
const auditContext = require('../utils/auditContext');

async function listAccounts(req, res) {
  const data = await accountService.listAccounts(req.query);
  res.json({ success: true, data });
}

async function getAccount(req, res) {
  const account = await accountService.getAccount(req.params.id);
  res.json({ success: true, data: { account } });
}

async function createAccount(req, res) {
  const account = await accountService.createAccount(req.body, auditContext(req));
  res.status(201).json({ success: true, message: 'Đã cấp tài khoản cho nhân viên.', data: { account } });
}

async function updateAccount(req, res) {
  const account = await accountService.updateAccount(
    req.params.id,
    req.user._id,
    req.body,
    auditContext(req)
  );
  res.json({ success: true, message: 'Đã cập nhật tài khoản.', data: { account } });
}

async function resetAccountPassword(req, res) {
  await accountService.resetAccountPassword(req.params.id, req.body, auditContext(req));
  res.json({ success: true, message: 'Đã đặt lại mật khẩu tài khoản.' });
}

async function setAccountStatus(req, res) {
  const account = await accountService.setAccountStatus(
    req.params.id,
    req.user._id,
    req.body,
    auditContext(req)
  );
  res.json({
    success: true,
    message: account.isActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.',
    data: { account }
  });
}

async function deleteAccount(req, res) {
  await accountService.deleteAccount(req.params.id, req.user._id, auditContext(req));
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
