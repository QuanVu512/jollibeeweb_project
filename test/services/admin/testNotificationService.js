const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Resolve path to backend modules
const candidate1 = path.resolve(__dirname, '../../../backend');
const candidate2 = path.resolve(__dirname, '../../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const notificationRepository = require(path.join(backendRoot, 'src/repositories/notification.repository'));
const customerRepository = require(path.join(backendRoot, 'src/repositories/customer.repository'));
const auditLogRepository = require(path.join(backendRoot, 'src/repositories/auditLog.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));

// Mock defaults
auditLogRepository.create = async () => ({});

// Import target unit: notificationService
const notificationService = require(path.join(backendRoot, 'src/services/notificationService'));

function createMockNotification(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439001',
    title: 'Khuyến mãi mùa hè',
    message: 'Giảm 20% toàn menu gà giòn cay trong tháng này!',
    audience: 'all_customers',
    priority: 'normal',
    recipientCount: 150,
    status: 'sent',
    sentAt: new Date(),
    createdBy: '507f1f77bcf86cd799439000',
    toObject() {
      return {
        _id: this._id,
        title: this.title,
        message: this.message,
        audience: this.audience,
        priority: this.priority,
        recipientCount: this.recipientCount,
        status: this.status,
        sentAt: this.sentAt,
        createdBy: this.createdBy
      };
    },
    ...overrides
  };
  return doc;
}

// -------------------------------------------------------------
// 1. listNotifications(query)
// -------------------------------------------------------------

test('UT_NOT_01: listNotifications(query) - Lấy danh sách thông báo đã gửi với phân trang', async () => {
  notificationRepository.findMany = async (filter, { skip, limit }) => {
    assert.equal(skip, 0);
    assert.equal(limit, 50);
    return [createMockNotification()];
  };
  notificationRepository.count = async () => 1;

  const result = await notificationService.listNotifications({ page: '1' });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].title, 'Khuyến mãi mùa hè');
  assert.equal(result.pagination.total, 1);
});

test('UT_NOT_02: listNotifications(query) - Lọc danh sách theo nhóm đối tượng và mức độ ưu tiên', async () => {
  notificationRepository.findMany = async (filter) => {
    assert.equal(filter.audience, 'active_customers');
    assert.equal(filter.priority, 'important');
    return [createMockNotification({ audience: 'active_customers', priority: 'important' })];
  };
  notificationRepository.count = async () => 1;

  const result = await notificationService.listNotifications({
    audience: 'active_customers',
    priority: 'important'
  });
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].audience, 'active_customers');
});

test('UT_NOT_03: listNotifications(query) - Ném lỗi khi nhóm khách nhận thông báo không hợp lệ', async () => {
  await assert.rejects(
    async () => {
      await notificationService.listNotifications({ audience: 'invalid_group' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Nhóm khách nhận thông báo không hợp lệ/);
      return true;
    }
  );
});

test('UT_NOT_04: listNotifications(query) - Ném lỗi khi mức độ ưu tiên thông báo không hợp lệ', async () => {
  await assert.rejects(
    async () => {
      await notificationService.listNotifications({ priority: 'super_high' });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Mức độ thông báo không hợp lệ/);
      return true;
    }
  );
});

// -------------------------------------------------------------
// 2. listCustomerNotifications(query)
// -------------------------------------------------------------

test('UT_NOT_05: listCustomerNotifications(query) - Lấy thông báo cho khách hàng với giới hạn hợp lệ', async () => {
  notificationRepository.findForCustomer = async (limit) => {
    assert.equal(limit, 10);
    return [createMockNotification()];
  };

  const result = await notificationService.listCustomerNotifications({ limit: '10' });
  assert.equal(result.length, 1);
});

// -------------------------------------------------------------
// 3. createNotification(body, userId, context)
// -------------------------------------------------------------

test('UT_NOT_06: createNotification(body, userId, context) - Quản trị viên gửi thông báo thành công và ghi audit log', async () => {
  const body = {
    title: 'Ưu đãi cuối tuần',
    message: 'Tặng 1 ly nước ngọt khi mua combo 2 miếng gà',
    audience: 'active_customers',
    priority: 'normal'
  };
  const userId = '507f1f77bcf86cd799439000';
  const context = { actor: { id: userId } };

  customerRepository.count = async (filter) => {
    assert.equal(filter.isActive, true);
    return 120; // 120 active customers
  };

  const mockCreated = createMockNotification({
    title: body.title,
    message: body.message,
    audience: body.audience,
    recipientCount: 120
  });

  notificationRepository.create = async (payload) => {
    assert.equal(payload.title, 'Ưu đãi cuối tuần');
    assert.equal(payload.recipientCount, 120);
    assert.equal(payload.status, 'sent');
    return mockCreated;
  };

  notificationRepository.populateCreator = async (notif) => notif;

  let auditAction = null;
  auditLogRepository.create = async (entry) => {
    auditAction = entry.action;
  };

  const result = await notificationService.createNotification(body, userId, context);
  assert.equal(result.title, 'Ưu đãi cuối tuần');
  assert.equal(result.recipientCount, 120);
  assert.equal(auditAction, 'notification.create');
});

test('UT_NOT_07: createNotification(body, userId, context) - Ném lỗi khi thiếu tiêu đề thông báo', async () => {
  await assert.rejects(
    async () => {
      await notificationService.createNotification({ message: 'Nội dung thông báo' }, 'user1', {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Vui lòng nhập tiêu đề thông báo/);
      return true;
    }
  );
});

test('UT_NOT_08: createNotification(body, userId, context) - Ném lỗi khi thiếu nội dung thông báo', async () => {
  await assert.rejects(
    async () => {
      await notificationService.createNotification({ title: 'Tiêu đề thông báo' }, 'user1', {});
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Vui lòng nhập nội dung thông báo/);
      return true;
    }
  );
});
