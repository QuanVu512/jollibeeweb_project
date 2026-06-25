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
const { INGREDIENT_DEFINITIONS, RECIPE_DEFINITIONS } = require('../src/data/inventoryRecipes');
const { getRoleLandingPage } = require('../src/constants/roleLandingPages');
const { ROLES } = require('../src/constants/roles');

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

test('quy đổi nguyên liệu theo đơn vị tồn kho mới', () => {
  const byCode = new Map(INGREDIENT_DEFINITIONS.map(item => [item.code, item]));
  const packaging = (code, unit) => byCode.get(code).packaging.find(item => item.unit === unit);

  assert.equal(byCode.get('BOT_CHIEN_GA').baseUnit, 'pack');
  assert.equal(byCode.get('MI').baseUnit, 'pack');
  assert.equal(byCode.get('MUOI').baseUnit, 'bag');
  assert.equal(byCode.get('SOT_MI').baseUnit, 'pack');
  assert.equal(byCode.get('PHO_MAI_BAO').baseUnit, 'gram');
  assert.equal(byCode.get('CA_CHUA').baseUnit, 'quả');
  assert.equal(byCode.get('XA_LACH').baseUnit, 'gram');
  assert.equal(byCode.get('CHICKEN_STRIP').baseUnit, 'pack');

  assert.equal(packaging('BOT_CHIEN_GA', 'carton').baseQuantity, 8);
  assert.equal(packaging('MI', 'carton').baseQuantity, 24);
  assert.equal(packaging('SOT_MI', 'case').baseQuantity, 8);
  assert.equal(packaging('PHO_MAI_BAO', 'pack').baseQuantity, 3000);
  assert.equal(packaging('XA_LACH', 'kilogram').baseQuantity, 1000);
  assert.equal(packaging('CHICKEN_STRIP', 'pack').baseQuantity, 1);
  assert.equal(packaging('BANH_NHAN_TOM', 'pack').baseQuantity, 6);
});

test('công thức món ăn chỉ tham chiếu nguyên liệu đã khai báo', () => {
  const ingredientCodes = new Set(INGREDIENT_DEFINITIONS.map(item => item.code));
  for (const recipe of RECIPE_DEFINITIONS) {
    assert.ok(recipe.ingredients.length > 0);
    for (const item of recipe.ingredients) {
      assert.ok(ingredientCodes.has(item.ingredientCode));
      assert.ok(Number.isFinite(item.quantityBase));
      assert.ok(item.quantityBase > 0);
    }
  }
});

test('mỗi vai trò đăng nhập được chuyển đến đúng khu vực', () => {
  assert.equal(getRoleLandingPage(ROLES.ADMIN), '/admin/');
  assert.equal(getRoleLandingPage(ROLES.CASHIER), '/banhang/quan_ly_don_hang.php');
  assert.equal(getRoleLandingPage(ROLES.KITCHEN), '/bep/index.php');
  assert.equal(getRoleLandingPage(ROLES.SHIPPER), '/shipper/shipper.html');
  assert.equal(getRoleLandingPage(ROLES.CUSTOMER), '/homepage.php');
});
