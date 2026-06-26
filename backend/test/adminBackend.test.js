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
const { calculateRecipeDeductions } = require('../src/services/inventoryRecipeService');

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
  assert.equal(byCode.get('CA_CHUA').baseUnit, 'pcs');
  assert.equal(byCode.get('XA_LACH').baseUnit, 'gram');
  assert.equal(byCode.get('CHICKEN_STRIP').baseUnit, 'pack');
  assert.equal(byCode.get('GA_MIENG').baseUnit, 'pack');
  assert.equal(byCode.get('BANH_XOAI_DAO').baseUnit, 'pack');
  assert.equal(byCode.get('GAO').baseUnit, 'kg');
  assert.equal(byCode.get('KHOAI_TAY').baseUnit, 'pack');
  assert.equal(byCode.get('BOT_KEM_VANI').baseUnit, 'pack');
  assert.equal(byCode.get('SOT_CAY').baseUnit, 'pack');
  assert.equal(byCode.get('PEPSI').baseUnit, 'case');

  for (const ingredient of INGREDIENT_DEFINITIONS) {
    assert.ok(ingredient.supplierName);
    for (const item of ingredient.packaging) {
      assert.ok(['case', 'bag', 'pack', 'pcs'].includes(item.unit));
    }
  }

  assert.equal(packaging('BOT_CHIEN_GA', 'case').baseQuantity, 8);
  assert.equal(packaging('MI', 'case').baseQuantity, 24);
  assert.equal(packaging('SOT_MI', 'case').baseQuantity, 8);
  assert.equal(packaging('PHO_MAI_BAO', 'pack').baseQuantity, 3000);
  assert.equal(packaging('CA_CHUA', 'pcs').baseQuantity, 1);
  assert.equal(packaging('XA_LACH', 'bag').baseQuantity, 1000);
  assert.equal(packaging('CHICKEN_STRIP', 'pack').baseQuantity, 1);
  assert.equal(packaging('GA_MIENG', 'case').baseQuantity, 10);
  assert.equal(packaging('GA_MIENG', 'pcs').baseQuantity, 1 / 8);
  assert.equal(packaging('BANH_NHAN_TOM', 'pack').baseQuantity, 6);
  assert.equal(packaging('BANH_NHAN_TOM', 'case').baseQuantity, 12);
  assert.equal(packaging('BANH_XOAI_DAO', 'case').baseQuantity, 6);
  assert.equal(packaging('BANH_XOAI_DAO', 'pcs').baseQuantity, 1 / 8);
  assert.equal(packaging('GAO', 'bag').baseQuantity, 20);
  assert.equal(packaging('KHOAI_TAY', 'case').baseQuantity, 9);
  assert.equal(packaging('BOT_KEM_VANI', 'case').baseQuantity, 7);
  assert.equal(packaging('SOT_CAY', 'case').baseQuantity, 6);
  assert.equal(packaging('PEPSI', 'case').baseQuantity, 1);
});

test('công thức món ăn chỉ tham chiếu nguyên liệu đã khai báo', () => {
  const ingredientCodes = new Set(INGREDIENT_DEFINITIONS.map(item => item.code));
  for (const recipe of RECIPE_DEFINITIONS) {
    assert.ok(recipe.ingredients.length > 0);
    assert.match(recipe.productCode, /^MON\d{4}$/);
    for (const item of recipe.ingredients) {
      assert.ok(ingredientCodes.has(item.ingredientCode));
      assert.ok(Number.isFinite(item.quantityBase));
      assert.ok(item.quantityBase > 0);
    }
  }
});

test('công thức mới trừ đúng đơn vị theo món bán', () => {
  const recipeByProduct = new Map(RECIPE_DEFINITIONS.map(recipe => [recipe.productCode, recipe]));
  const quantity = (productCode, ingredientCode) => {
    const recipe = recipeByProduct.get(productCode);
    return recipe.ingredients.find(item => item.ingredientCode === ingredientCode)?.quantityBase;
  };

  assert.equal(quantity('MON0004', 'SOT_CAY'), 1 / 30);
  assert.equal(quantity('MON0001', 'GA_MIENG'), 1 / 8);
  assert.equal(quantity('MON0008', 'GAO'), 0.1);
  assert.equal(quantity('MON0010', 'KHOAI_TAY'), 1 / 20);
  assert.equal(quantity('MON0011', 'KHOAI_TAY'), 1 / 15);
  assert.equal(quantity('MON0012', 'BANH_XOAI_DAO'), 1 / 8);
  assert.equal(quantity('MON0013', 'BOT_KEM_VANI'), 1 / 40);
  assert.equal(quantity('MON0014', 'PEPSI'), 1 / 50);
});

test('tính lượng nguyên liệu cần trừ theo công thức món', () => {
  const recipesByProductCode = new Map([
    ['MON0001', {
      productCode: 'MON0001',
      yieldQuantity: 1,
      ingredients: [
        { ingredient: 'ing-bot', ingredientCode: 'BOT_CHIEN_GA', quantityBase: 1 / 15 }
      ]
    }],
    ['MON0006', {
      productCode: 'MON0006',
      yieldQuantity: 1,
      ingredients: [
        { ingredient: 'ing-mi', ingredientCode: 'MI', quantityBase: 1 / 3 },
        { ingredient: 'ing-bot', ingredientCode: 'BOT_CHIEN_GA', quantityBase: 1 / 30 }
      ]
    }]
  ]);

  const result = calculateRecipeDeductions({
    items: [
      { productCode: 'MON0001', name: 'Gà giòn', quantity: 2 },
      { productCode: 'MON0006', name: 'Mì Ý', quantity: 3 }
    ]
  }, recipesByProductCode);

  const byCode = new Map(result.deductions.map(item => [item.ingredientCode, item.quantity]));
  assert.equal(byCode.get('BOT_CHIEN_GA'), 0.233333);
  assert.equal(byCode.get('MI'), 1);
  assert.deepEqual(result.missingRecipes, []);
});

test('báo rõ món chưa có công thức kho', () => {
  const result = calculateRecipeDeductions({
    items: [
      { productCode: 'MON0099', name: 'Món chưa cấu hình', quantity: 1 }
    ]
  }, new Map());

  assert.deepEqual(result.deductions, []);
  assert.deepEqual(result.missingRecipes, [
    { productCode: 'MON0099', name: 'Món chưa cấu hình' }
  ]);
});

test('mỗi vai trò đăng nhập được chuyển đến đúng khu vực', () => {
  assert.equal(getRoleLandingPage(ROLES.ADMIN), '/admin/');
  assert.equal(getRoleLandingPage(ROLES.CASHIER), '/banhang/quan_ly_don_hang.html');
  assert.equal(getRoleLandingPage(ROLES.KITCHEN), '/kitchen.html');
  assert.equal(getRoleLandingPage(ROLES.SHIPPER), '/shipper/shipper.html');
  assert.equal(getRoleLandingPage(ROLES.CUSTOMER), '/homepage.php');
});
