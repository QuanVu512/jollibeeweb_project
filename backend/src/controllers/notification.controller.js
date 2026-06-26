const Notification = require('../models/Notification');
const Customer = require('../models/Customer');
const { pagination, paginationResult } = require('../utils/adminQuery');
const { escapeRegex } = require('../utils/text');
const { recordAudit } = require('../services/auditService');
const {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_PRIORITIES,
  validateNotificationPayload
} = require('../validators/notificationValidators');
const ApiError = require('../utils/ApiError');

function audienceFilter(audience) {
  return audience === 'active_customers' ? { isActive: true } : {};
}

async function listNotifications(req, res) {
  const { page, limit, skip } = pagination(req.query, { defaultLimit: 50 });
  const filter = {};

  if (req.query.audience) {
    if (!NOTIFICATION_AUDIENCES.includes(req.query.audience)) {
      throw new ApiError(400, 'Nhóm khách nhận thông báo không hợp lệ.');
    }
    filter.audience = req.query.audience;
  }

  if (req.query.priority) {
    if (!NOTIFICATION_PRIORITIES.includes(req.query.priority)) {
      throw new ApiError(400, 'Mức độ thông báo không hợp lệ.');
    }
    filter.priority = req.query.priority;
  }

  if (req.query.search?.trim()) {
    const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ title: search }, { message: search }];
  }

  const [items, total] = await Promise.all([
    Notification.find(filter)
      .populate('createdBy', 'username displayName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments(filter)
  ]);

  res.json({ success: true, data: { items, pagination: paginationResult(page, limit, total) } });
}

async function createNotification(req, res) {
  const payload = validateNotificationPayload(req.body);
  const recipientCount = await Customer.countDocuments(audienceFilter(payload.audience));
  const notification = await Notification.create({
    ...payload,
    recipientCount,
    status: 'sent',
    sentAt: new Date(),
    createdBy: req.user?._id || null
  });

  await recordAudit(req, {
    action: 'notification.create',
    entityType: 'notification',
    entityId: notification._id,
    before: null,
    after: notification
  });

  await notification.populate('createdBy', 'username displayName');
  res.status(201).json({
    success: true,
    message: 'Đã lưu thông báo cho khách hàng.',
    data: { notification }
  });
}

module.exports = { listNotifications, createNotification };
