const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// Đường dẫn linh hoạt tới thư mục backend
const candidate1 = path.resolve(__dirname, '../../backend');
const candidate2 = path.resolve(__dirname, '../..');
const backendRoot = fs.existsSync(path.join(candidate1, 'src')) ? candidate1 : candidate2;

const orderRepository = require(path.join(backendRoot, 'src/repositories/order.repository'));
const productRepository = require(path.join(backendRoot, 'src/repositories/product.repository'));
const databaseRepository = require(path.join(backendRoot, 'src/repositories/database.repository'));
const ApiError = require(path.join(backendRoot, 'src/utils/ApiError'));
const { ORDER_STATUS } = require(path.join(backendRoot, 'src/constants/orderStatus'));
const { ROLES } = require(path.join(backendRoot, 'src/constants/roles'));
const User = require(path.join(backendRoot, 'src/models/User'));

// Mock mặc định cho database transaction và object id
databaseRepository.isValidObjectId = (id) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
databaseRepository.transaction = async (work) => work({});

// Mock delegates cho inventoryRecipeService TRƯỚC KHI load banhangService
const inventoryRecipeService = require(path.join(backendRoot, 'src/services/inventoryRecipeService'));
let mockCheckStock = async () => true;
let mockDeductIngredients = async () => ({ missingRecipes: [] });
let mockRestoreIngredients = async () => ({});
let mockCalculatePortions = async (products) => products.map(p => ({ ...p.toObject(), availablePortions: 15 }));

inventoryRecipeService.checkOrderStockSufficiency = async (...args) => mockCheckStock(...args);
inventoryRecipeService.deductIngredientsForOrder = async (...args) => mockDeductIngredients(...args);
inventoryRecipeService.restoreIngredientsForOrder = async (...args) => mockRestoreIngredients(...args);
inventoryRecipeService.calculateAvailablePortionsForProducts = async (...args) => mockCalculatePortions(...args);

// Import target unit: banhangService
const banhangService = require(path.join(backendRoot, 'src/services/banhangService'));

// Hàm helper tạo đơn hàng mẫu (mock Order document)
function createMockOrder(overrides = {}) {
  const doc = {
    _id: '507f1f77bcf86cd799439001',
    orderCode: 'DH100001',
    customerName: 'Khách lẻ',
    orderType: 'dine_in',
    tableNumber: '5',
    deliveryAddress: 'Bàn 5',
    status: ORDER_STATUS.PENDING,
    isInvoicePrinted: false,
    invoicePrintedAt: null,
    items: [
      {
        product: '507f1f77bcf86cd799439011',
        productCode: 'GA_GION_1',
        name: 'Gà Giòn Vui Vẻ',
        quantity: 2,
        unitPrice: 35000,
        lineTotal: 70000
      }
    ],
    subtotal: 70000,
    total: 70000,
    discount: 0,
    shippingFee: 0,
    payment: {
      method: 'cash',
      status: 'unpaid'
    },
    statusHistory: [],
    async validate() { return true; },
    toObject() { return { ...this }; },
    set(fields) { Object.assign(this, fields); },
    ...overrides
  };
  return doc;
}

// Helper tạo sản phẩm mẫu (mock Product document)
function createMockProduct(overrides = {}) {
  return {
    _id: '507f1f77bcf86cd799439011',
    productCode: 'GA_GION_1',
    name: 'Gà Giòn Vui Vẻ',
    price: 35000,
    costPrice: 20000,
    isActive: true,
    toObject() { return { ...this }; },
    ...overrides
  };
}

// =================================================================
// 1. createOrder(body, userId, userRole)
// =================================================================

test('UT_POS_01: createOrder - Tạo đơn hàng tại quầy thành công cho khách ăn tại bàn', async () => {
  const userId = '507f1f77bcf86cd799439099'; // id nhân viên thu ngân fake
  const productId = '507f1f77bcf86cd799439011'; // id món gà giòn fake
  const mockProduct = createMockProduct({ _id: productId, price: 35000 });
  const mockOrder = createMockOrder({
    items: [{ product: productId, name: 'Gà Giòn Vui Vẻ', quantity: 2, unitPrice: 35000, lineTotal: 70000 }],
    total: 70000
  });

  const body = {
    orderType: 'dine_in',
    tableNumber: '5',
    paymentMethod: 'cash',
    items: [{ product: productId, quantity: 2 }]
  };

  orderRepository.findOne = async () => null; // Bàn số 5 chưa có đơn
  productRepository.findById = async (id) => (id === productId ? mockProduct : null);
  orderRepository.createDocument = (payload) => {
    assert.equal(payload.tableNumber, '5');
    assert.equal(payload.total, 70000);
    return mockOrder;
  };
  mockCheckStock = async () => true; // Kho đủ nguyên liệu
  orderRepository.save = async (order) => order;

  const result = await banhangService.createOrder(body, userId, ROLES.CASHIER);
  assert.equal(result.order.status, ORDER_STATUS.PENDING);
  assert.equal(result.order.total, 70000);
});

test('UT_POS_02: createOrder - Tạo đơn hàng thất bại khi giỏ hàng không có sản phẩm', async () => {
  const userId = '507f1f77bcf86cd799439099';
  const body = {
    orderType: 'dine_in',
    tableNumber: '1',
    paymentMethod: 'cash',
    items: [] // Giỏ hàng rỗng
  };

  await assert.rejects(
    async () => {
      await banhangService.createOrder(body, userId, ROLES.CASHIER);
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.equal(err.message, 'Đơn hàng phải có ít nhất một món ăn.');
      return true;
    }
  );
});

test('UT_POS_03: createOrder - Tạo đơn hàng thất bại khi sản phẩm chọn không tồn tại', async () => {
  const userId = '507f1f77bcf86cd799439099';
  const body = {
    orderType: 'dine_in',
    tableNumber: '2',
    items: [{ product: '507f1f77bcf86cd799439999', quantity: 1 }] // ID không có trong DB
  };

  orderRepository.findOne = async () => null;
  productRepository.findById = async () => null; // Mock không tìm thấy sản phẩm

  await assert.rejects(
    async () => {
      await banhangService.createOrder(body, userId, ROLES.CASHIER);
    },
    (err) => {
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy sản phẩm/);
      return true;
    }
  );
});

test('UT_POS_04: createOrder - Tạo đơn hàng thất bại khi nguyên liệu kho không đủ phục vụ', async () => {
  const userId = '507f1f77bcf86cd799439099';
  const productId = '507f1f77bcf86cd799439011';
  const mockProduct = createMockProduct({ _id: productId, price: 35000 });
  const mockOrder = createMockOrder();

  const body = {
    orderType: 'dine_in',
    tableNumber: '3',
    items: [{ product: productId, quantity: 10 }]
  };

  orderRepository.findOne = async () => null;
  productRepository.findById = async () => mockProduct;
  orderRepository.createDocument = () => mockOrder;
  // Mock kho báo thiếu nguyên liệu ném lỗi 400
  mockCheckStock = async () => {
    throw new ApiError(400, 'Không đủ nguyên liệu trong kho để phục vụ món: Gà Giòn Vui Vẻ (chỉ còn đủ 3 suất).');
  };

  await assert.rejects(
    async () => {
      await banhangService.createOrder(body, userId, ROLES.CASHIER);
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Không đủ nguyên liệu trong kho/);
      return true;
    }
  );
});

// =================================================================
// 2. acceptOrder(id, userId)
// =================================================================

test('UT_POS_05: acceptOrder - Thu ngân xác nhận đơn và in hóa đơn thành công', async () => {
  const orderId = '507f1f77bcf86cd799439001';
  const userId = '507f1f77bcf86cd799439099';
  const mockOrder = createMockOrder({ _id: orderId, status: ORDER_STATUS.PENDING });

  orderRepository.findById = async (id) => (id === orderId ? mockOrder : null);
  mockDeductIngredients = async () => ({ missingRecipes: [] });
  orderRepository.save = async (order) => order;

  const result = await banhangService.acceptOrder(orderId, userId);
  assert.equal(result.order.status, ORDER_STATUS.PREPARING); // Chuyển sang preparing cho bếp
  assert.equal(result.order.isInvoicePrinted, true); // Đánh dấu đã in hóa đơn
  assert.equal(result.order.payment.status, 'paid'); // Thanh toán thành công
});

test('UT_POS_06: acceptOrder - Xác nhận đơn thất bại khi đơn không ở trạng thái chờ duyệt', async () => {
  const orderId = '507f1f77bcf86cd799439001';
  const userId = '507f1f77bcf86cd799439099';
  const mockOrder = createMockOrder({ _id: orderId, status: ORDER_STATUS.PREPARING }); // Đã duyệt rồi

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await banhangService.acceptOrder(orderId, userId);
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.equal(err.message, 'Đơn hàng này không ở trạng thái chờ duyệt.');
      return true;
    }
  );
});

test('UT_POS_07: acceptOrder - Xác nhận đơn thất bại khi mã đơn không tồn tại', async () => {
  const orderId = '507f1f77bcf86cd799439099'; // id không tồn tại
  const userId = '507f1f77bcf86cd799439099';

  orderRepository.findById = async () => null; // Mock trả về null

  await assert.rejects(
    async () => {
      await banhangService.acceptOrder(orderId, userId);
    },
    (err) => {
      assert.equal(err.statusCode, 404);
      assert.equal(err.message, 'Không tìm thấy đơn hàng.');
      return true;
    }
  );
});

// =================================================================
// 3. updateOrder(id, body, userId, userRole)
// =================================================================

test('UT_POS_08: updateOrder - Cập nhật món trong đơn hàng thành công trước khi duyệt', async () => {
  const orderId = '507f1f77bcf86cd799439001';
  const userId = '507f1f77bcf86cd799439099';
  const productId = '507f1f77bcf86cd799439011';
  const mockOrder = createMockOrder({ _id: orderId, status: ORDER_STATUS.PENDING });
  const mockProduct = createMockProduct({ _id: productId, price: 35000 });

  const body = {
    items: [{ product: productId, quantity: 3 }] // Tăng lên 3 phần gà
  };

  orderRepository.findById = async () => mockOrder;
  productRepository.findById = async () => mockProduct;
  mockRestoreIngredients = async () => ({});
  mockDeductIngredients = async () => ({ missingRecipes: [] });
  orderRepository.save = async (order) => order;

  const result = await banhangService.updateOrder(orderId, body, userId, ROLES.CASHIER);
  assert.equal(result.order.items[0].quantity, 3);
  assert.equal(result.order.total, 105000); // 3 * 35000 = 105000
});

test('UT_POS_09: updateOrder - Cập nhật đơn thất bại khi đơn đã hoàn tất phục vụ', async () => {
  const orderId = '507f1f77bcf86cd799439001';
  const userId = '507f1f77bcf86cd799439099';
  const mockOrder = createMockOrder({ _id: orderId, status: ORDER_STATUS.COMPLETED }); // Đã xong

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await banhangService.updateOrder(orderId, { items: [] }, userId, ROLES.CASHIER);
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.equal(err.message, 'Đơn hàng đã hoàn tất, không thể chỉnh sửa.');
      return true;
    }
  );
});

// =================================================================
// 4. cancelOrder(id, body, userId, userRole)
// =================================================================

test('UT_POS_10: cancelOrder - Hủy đơn hàng tại quầy thành công và hoàn trả kho', async () => {
  const orderId = '507f1f77bcf86cd799439001';
  const userId = '507f1f77bcf86cd799439099';
  const mockOrder = createMockOrder({
    _id: orderId,
    status: ORDER_STATUS.PENDING,
    inventoryDeductedAt: new Date() // Đã từng trừ kho
  });

  let restoredCalled = false;
  orderRepository.findById = async () => mockOrder;
  mockRestoreIngredients = async () => {
    restoredCalled = true;
    return {};
  };
  orderRepository.save = async (order) => order;

  const result = await banhangService.cancelOrder(orderId, { reason: 'Khách đổi ý không mua nữa' }, userId, ROLES.CASHIER);
  assert.equal(result.status, ORDER_STATUS.CANCELLED);
  assert.equal(restoredCalled, true); // Đã gọi hoàn nguyên liệu kho
});

test('UT_POS_11: cancelOrder - Hủy đơn hàng thất bại khi đơn đã hoàn tất phục vụ', async () => {
  const orderId = '507f1f77bcf86cd799439001';
  const userId = '507f1f77bcf86cd799439099';
  const mockOrder = createMockOrder({ _id: orderId, status: ORDER_STATUS.COMPLETED });

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await banhangService.cancelOrder(orderId, { reason: 'Muốn hủy đơn' }, userId, ROLES.CASHIER);
    },
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.equal(err.message, 'Đơn hàng đã hoàn tất, không thể hủy.');
      return true;
    }
  );
});

// =================================================================
// 5. serveOrder(id, userId) & readyOrder(id, userId)
// =================================================================

test('UT_POS_12: serveOrder - Bếp phục vụ xong đơn tại bàn thành công', async () => {
  const orderId = '507f1f77bcf86cd799439001';
  const userId = '507f1f77bcf86cd799439088'; // id nhân viên bếp fake
  const mockOrder = createMockOrder({ _id: orderId, status: ORDER_STATUS.PREPARING, orderType: 'dine_in' });

  orderRepository.findById = async () => mockOrder;
  mockDeductIngredients = async () => ({ missingRecipes: [] });
  orderRepository.save = async (order) => order;

  const result = await banhangService.serveOrder(orderId, userId);
  assert.equal(result.order.status, ORDER_STATUS.COMPLETED); // Chuyển sang completed
  assert.equal(result.message, 'Đơn hàng đã được phục vụ.');
});

test('UT_POS_13: readyOrder - Chuyển đơn giao hàng sang trạng thái sẵn sàng giao', async () => {
  const orderId = '507f1f77bcf86cd799439002';
  const userId = '507f1f77bcf86cd799439088';
  const mockOrder = createMockOrder({ _id: orderId, status: ORDER_STATUS.PREPARING, orderType: 'delivery' });

  orderRepository.findById = async () => mockOrder;
  mockDeductIngredients = async () => ({ missingRecipes: [] });
  orderRepository.save = async (order) => order;

  const result = await banhangService.readyOrder(orderId, userId);
  assert.equal(result.order.status, ORDER_STATUS.READY_FOR_DELIVERY); // Sẵn sàng ship
  assert.equal(result.message, 'Đơn hàng đã sẵn sàng giao.');
});

// =================================================================
// 6. printInvoice(id, userId)
// =================================================================

test('UT_POS_14: printInvoice - In lại hóa đơn thanh toán thành công', async () => {
  const orderId = '507f1f77bcf86cd799439001';
  const userId = '507f1f77bcf86cd799439099';
  const mockOrder = createMockOrder({ _id: orderId, isInvoicePrinted: false, source: 'pos' });

  orderRepository.findById = async () => mockOrder;
  orderRepository.save = async (order) => order;

  const result = await banhangService.printInvoice(orderId, userId);
  assert.equal(result.isInvoicePrinted, true);
  assert.ok(result.invoicePrintedAt instanceof Date);
});

// =================================================================
// 7. verifyAdminPassword(password)
// =================================================================

test('UT_POS_15: verifyAdminPassword - Xác thực mật khẩu Quản trị viên thành công', async () => {
  const mockAdmin = {
    _id: '507f1f77bcf86cd799439000',
    username: 'admin01',
    passwordHash: 'hashed_password',
    async comparePassword(pwd) {
      return pwd === 'Admin@123';
    }
  };

  User.find = () => ({
    select: async () => [mockAdmin]
  });

  const isValid = await banhangService.verifyAdminPassword('Admin@123');
  assert.equal(isValid, true); // Xác thực đúng
});

test('UT_POS_16: verifyAdminPassword - Xác thực mật khẩu Quản trị viên thất bại do sai mật khẩu', async () => {
  const mockAdmin = {
    _id: '507f1f77bcf86cd799439000',
    username: 'admin01',
    passwordHash: 'hashed_password',
    async comparePassword() {
      return false; // Sai mật khẩu
    }
  };

  User.find = () => ({
    select: async () => [mockAdmin]
  });

  const isValid = await banhangService.verifyAdminPassword('WrongPass');
  assert.equal(isValid, false);
});

// =================================================================
// 8. getProducts(query) & getPendingOrders()
// =================================================================

const productAvailability = require(path.join(backendRoot, 'src/services/productAvailability'));

test('UT_POS_17: getProducts - Lấy danh sách món ăn và tính số suất khả dụng từ kho', async () => {
  const mockProducts = [
    createMockProduct({ _id: '507f1f77bcf86cd799439011', productCode: 'GA_GION_1', name: 'Gà Giòn', price: 35000 }),
    createMockProduct({ _id: '507f1f77bcf86cd799439012', productCode: 'MI_Y_1', name: 'Mì Ý', price: 40000 })
  ];

  productRepository.findActive = async () => mockProducts;
  mockCalculatePortions = async () => ({ GA_GION_1: 15, MI_Y_1: 20 });
  productAvailability.withAvailability = async (products) => products.map(p => ({
    ...p.toObject(),
    availableQuantity: 15,
    canOrder: true
  }));

  const results = await banhangService.getProducts('dine_in');
  assert.equal(results.length, 2);
  assert.equal(results[0].availableServings, 15);
  assert.equal(results[0].canOrder, true);
});


test('UT_POS_18: getPendingOrders - Lấy danh sách đơn chờ xác nhận thành công', async () => {
  const mockOrders = [
    createMockOrder({ _id: '507f1f77bcf86cd799439001', orderCode: 'DH100001' }),
    createMockOrder({ _id: '507f1f77bcf86cd799439002', orderCode: 'DH100002' })
  ];

  orderRepository.findMany = async () => mockOrders;

  const results = await banhangService.getPendingOrders();
  assert.equal(results.length, 2);
  assert.equal(results[0].orderCode, 'DH100001');
  assert.equal(results[1].orderCode, 'DH100002');
});
