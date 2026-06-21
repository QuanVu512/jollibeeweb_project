const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateEmployeePayload,
  validateAccountPayload,
  validateAccountUpdate,
  validatePasswordReset
} = require('../src/validators/adminValidators');
const { pagination, dateRange } = require('../src/utils/adminQuery');
const Order = require('../src/models/Order');

test('kiểm tra và chuẩn hóa dữ liệu nhân viên', () => {
  const result = validateEmployeePayload({
    fullName: '  Nguyễn Văn A  ',
    phone: '0912345678',
    email: 'admin@example.com',
    gender: 'Nam'
  });
  assert.equal(result.fullName, 'Nguyễn Văn A');
  assert.equal(result.phone, '0912345678');
  assert.equal(result.gender, 'Nam');
});

test('không cho cấp tài khoản với vai trò khách hàng', () => {
  assert.throws(
    () => validateAccountPayload({
      username: 'khachhang',
      password: '12345678',
      role: 'customer',
      employeeId: '507f1f77bcf86cd799439011'
    }),
    /Vai trò không hợp lệ/
  );
});

test('kiểm tra cập nhật vai trò và đặt lại mật khẩu', () => {
  assert.deepEqual(validateAccountUpdate({ role: 'shipper' }), { role: 'shipper' });
  assert.equal(validatePasswordReset({ password: 'mat-khau-moi' }), 'mat-khau-moi');
  assert.throws(() => validatePasswordReset({ password: '123' }), /ít nhất 8 ký tự/);
});

test('phân trang luôn nằm trong giới hạn an toàn', () => {
  assert.deepEqual(pagination({ page: '-2', limit: '999' }), { page: 1, limit: 100, skip: 0 });
});

test('kiểm tra khoảng ngày báo cáo', () => {
  assert.throws(() => dateRange({ from: '2026-06-20', to: '2026-06-01' }), /Ngày bắt đầu/);
  const result = dateRange({ from: '2026-06-01', to: '2026-06-20' }, 'orderedAt');
  assert.ok(result.orderedAt.$gte instanceof Date);
  assert.ok(result.orderedAt.$lte instanceof Date);
});

test('đơn hàng tự tính thành tiền từ dữ liệu chi tiết', async () => {
  const order = new Order({
    orderCode: 'DH999999',
    items: [{ name: 'Gà giòn', quantity: 2, unitPrice: 50000, costPrice: 30000 }],
    shippingFee: 10000,
    discount: 5000
  });
  await order.validate();
  assert.equal(order.items[0].lineTotal, 100000);
  assert.equal(order.subtotal, 100000);
  assert.equal(order.total, 105000);
});
