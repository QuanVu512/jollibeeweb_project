const ROLES = Object.freeze({
  ADMIN: 'admin',
  CASHIER: 'cashier',
  KITCHEN: 'kitchen',
  SHIPPER: 'shipper',
  CUSTOMER: 'customer'
});

const STAFF_ROLES = Object.freeze([
  ROLES.ADMIN,
  ROLES.CASHIER,
  ROLES.KITCHEN,
  ROLES.SHIPPER
]);

const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: 'Quản trị viên',
  [ROLES.CASHIER]: 'Thu ngân',
  [ROLES.KITCHEN]: 'Nhân viên bếp',
  [ROLES.SHIPPER]: 'Nhân viên giao hàng',
  [ROLES.CUSTOMER]: 'Khách hàng'
});

module.exports = { ROLES, STAFF_ROLES, ROLE_LABELS };
