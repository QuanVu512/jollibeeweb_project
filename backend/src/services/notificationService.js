const notificationRepository = require('../repositories/notification.repository');
const customerRepository = require('../repositories/customer.repository');
const { pagination, paginationResult } = require('../utils/adminQuery');
const { escapeRegex } = require('../utils/text');
const { recordAudit } = require('./auditService');
const {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_PRIORITIES,
  validateNotificationPayload
} = require('../validators/notificationValidators');
const ApiError = require('../utils/ApiError');

function audienceFilter(audience) {
  return audience === 'active_customers' ? { isActive: true } : {};
}

async function listNotifications(query) {
  const { page, limit, skip } = pagination(query, { defaultLimit: 50 });
  const filter = {};

  if (query.audience) {
    if (!NOTIFICATION_AUDIENCES.includes(query.audience)) {
      throw new ApiError(400, 'Nhóm khách nhận thông báo không hợp lệ.');
    }
    filter.audience = query.audience;
  }

  if (query.priority) {
    if (!NOTIFICATION_PRIORITIES.includes(query.priority)) {
      throw new ApiError(400, 'Mức độ thông báo không hợp lệ.');
    }
    filter.priority = query.priority;
  }

  if (query.search?.trim()) {
    const search = new RegExp(escapeRegex(query.search.trim()), 'i');
    filter.$or = [{ title: search }, { message: search }];
  }

  const [items, total] = await Promise.all([
    notificationRepository.findMany(filter, { skip, limit }),
    notificationRepository.count(filter)
  ]);

  return { items, pagination: paginationResult(page, limit, total) };
}

function listCustomerNotifications(query) {
  const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 20);
  return notificationRepository.findForCustomer(limit);
}

async function createNotification(body, userId, context) {
  const payload = validateNotificationPayload(body);
  const recipientCount = await customerRepository.count(audienceFilter(payload.audience));
  const notification = await notificationRepository.create({
    ...payload,
    recipientCount,
    status: 'sent',
    sentAt: new Date(),
    createdBy: userId || null
  });

  await recordAudit(context, {
    action: 'notification.create',
    entityType: 'notification',
    entityId: notification._id,
    before: null,
    after: notification
  });

  await notificationRepository.populateCreator(notification);
  return notification;
}

module.exports = { listNotifications, listCustomerNotifications, createNotification };
