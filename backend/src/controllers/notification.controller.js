const notificationService = require('../services/notificationService');
const auditContext = require('../utils/auditContext');

async function listNotifications(req, res) {
  const data = await notificationService.listNotifications(req.query);
  res.json({ success: true, data });
}

async function listCustomerNotifications(req, res) {
  const items = await notificationService.listCustomerNotifications(req.query);
  res.json({ success: true, data: { items } });
}

async function createNotification(req, res) {
  const notification = await notificationService.createNotification(
    req.body,
    req.user?._id,
    auditContext(req)
  );
  res.status(201).json({
    success: true,
    message: 'Đã lưu thông báo cho khách hàng.',
    data: { notification }
  });
}

module.exports = { listNotifications, listCustomerNotifications, createNotification };
