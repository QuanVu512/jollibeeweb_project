const { ROLES, ROLE_LABELS } = require('./roles');

const ROLE_DEFINITIONS = Object.freeze([
  {
    key: ROLES.ADMIN,
    label: ROLE_LABELS[ROLES.ADMIN],
    description: 'Quản lý nhân viên, tài khoản, báo cáo và cấu hình hệ thống.',
    permissions: ['employees.manage', 'accounts.manage', 'roles.view', 'reports.view', 'reports.export']
  },
  {
    key: ROLES.CASHIER,
    label: ROLE_LABELS[ROLES.CASHIER],
    description: 'Tạo đơn tại quầy, tiếp nhận hoặc hủy đơn online, xác nhận đơn đã hoàn tất và xem thông tin khách hàng.',
    permissions: ['products.view', 'customers.view', 'customers.create', 'orders.create', 'orders.accept', 'orders.cancel', 'orders.prepare', 'orders.ready']
  },
  {
    key: ROLES.KITCHEN,
    label: ROLE_LABELS[ROLES.KITCHEN],
    description: 'Xem đơn cần chế biến, quản lý món ăn và tồn kho.',
    permissions: ['orders.kitchen.view', 'products.manage', 'inventory.manage']
  },
  {
    key: ROLES.SHIPPER,
    label: ROLE_LABELS[ROLES.SHIPPER],
    description: 'Nhận đơn giao, cập nhật đang giao, hoàn thành, thất bại hoặc trả lại bếp.',
    permissions: ['orders.delivery.view', 'orders.delivery.accept', 'orders.delivery.complete', 'orders.delivery.fail', 'orders.delivery.return']
  },
  {
    key: ROLES.CUSTOMER,
    label: ROLE_LABELS[ROLES.CUSTOMER],
    description: 'Xem thực đơn, quản lý giỏ hàng, đặt hàng và theo dõi đơn của chính mình.',
    permissions: ['products.view', 'cart.manage', 'orders.create.own', 'orders.view.own', 'profile.manage.own']
  }
]);

module.exports = { ROLE_DEFINITIONS };
