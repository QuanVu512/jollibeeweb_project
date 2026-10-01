const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");

// Đường dẫn linh hoạt tới thư mục backend
const candidate1 = path.resolve(__dirname, "../../backend");
const candidate2 = path.resolve(__dirname, "../..");
const backendRoot = fs.existsSync(path.join(candidate1, "src"))
  ? candidate1
  : candidate2;

const orderRepository = require(
  path.join(backendRoot, "src/repositories/order.repository"),
);
const databaseRepository = require(
  path.join(backendRoot, "src/repositories/database.repository"),
);
const ApiError = require(path.join(backendRoot, "src/utils/ApiError"));
const { ORDER_STATUS } = require(
  path.join(backendRoot, "src/constants/orderStatus"),
);

// Mock mặc định cho database repository
databaseRepository.isValidObjectId = (id) =>
  typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
databaseRepository.transaction = async (work) => work({});

// Import target unit: shipperService
const shipperService = require(
  path.join(backendRoot, "src/services/shipperService"),
);

// Helper tạo mock Order document
function createMockOrder(overrides = {}) {
  const doc = {
    _id: "507f1f77bcf86cd799439001",
    orderCode: "DH100001",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    customer: {
      fullName: "Nguyễn Văn A",
      phone: "0901234567",
      address: "123 Đường 3/2, Quận 10, TP.HCM",
    },
    orderType: "delivery",
    deliveryAddress: "123 Đường 3/2, Quận 10, TP.HCM",
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    items: [
      {
        name: "Gà Giòn Vui Vẻ (2 miếng)",
        quantity: 2,
        unitPrice: 70000,
        lineTotal: 140000,
      },
      {
        name: "Khoai tây chiên (vừa)",
        quantity: 1,
        unitPrice: 25000,
        lineTotal: 25000,
      },
    ],
    subtotal: 165000,
    shippingFee: 15000,
    discount: 30000,
    total: 150000,
    payment: {
      method: "cod",
      status: "unpaid",
      paidAt: null,
    },
    assignedShipper: null,
    statusHistory: [],
    failureReason: "",
    async save() {
      return this;
    },
    ...overrides,
  };
  return doc;
}

const SHIPPER_A_ID = "507f1f77bcf86cd799439011";
const SHIPPER_B_ID = "507f1f77bcf86cd799439022";
const VALID_ORDER_ID = "507f1f77bcf86cd799439001";

// =============================================================================
// UT_SHP_01: listAvailableOrders - Lấy danh sách Đơn mới thành công
// =============================================================================
test("UT_SHP_01: listAvailableOrders - Lấy danh sách Đơn mới thành công", async () => {
  const mockOrders = [
    createMockOrder({
      _id: "507f1f77bcf86cd799439001",
      orderCode: "DH100001",
      status: ORDER_STATUS.READY_FOR_DELIVERY,
      assignedShipper: null,
    }),
    createMockOrder({
      _id: "507f1f77bcf86cd799439002",
      orderCode: "DH100002",
      status: ORDER_STATUS.READY_FOR_DELIVERY,
      assignedShipper: null,
    }),
  ];

  orderRepository.findMany = async (filter) => {
    assert.equal(filter.status, ORDER_STATUS.READY_FOR_DELIVERY);
    assert.equal(filter.orderType, "delivery");
    return mockOrders;
  };

  const result = await shipperService.listAvailableOrders();
  assert.equal(result.length, 2);
  assert.equal(result[0].orderCode, "DH100001");
  assert.equal(result[1].orderCode, "DH100002");
});

// =============================================================================
// UT_SHP_02: listAvailableOrders - Không có đơn chờ nhận
// =============================================================================
test("UT_SHP_02: listAvailableOrders - Không có đơn chờ nhận", async () => {
  orderRepository.findMany = async () => [];

  const result = await shipperService.listAvailableOrders();
  assert.ok(Array.isArray(result));
  assert.equal(result.length, 0);
});

// =============================================================================
// UT_SHP_03: listAvailableOrders - Không hiển thị đơn đã được shipper khác nhận
// =============================================================================
test("UT_SHP_03: listAvailableOrders - Không hiển thị đơn đã được shipper khác nhận", async () => {
  const allReadyOrders = [
    createMockOrder({
      _id: "507f1f77bcf86cd799439001",
      orderCode: "DH100001",
      assignedShipper: SHIPPER_B_ID,
    }),
    createMockOrder({
      _id: "507f1f77bcf86cd799439002",
      orderCode: "DH100002",
      assignedShipper: null,
    }),
  ];

  orderRepository.findMany = async (filter) => {
    return allReadyOrders.filter((o) => {
      const matchStatus = o.status === filter.status;
      const matchType = o.orderType === filter.orderType;
      const matchShipper =
        filter.assignedShipper === null ? o.assignedShipper === null : true;
      return matchStatus && matchType && matchShipper;
    });
  };

  const result = await shipperService.listAvailableOrders();
  assert.equal(result.length, 1);
  assert.equal(result[0].orderCode, "DH100002");
  assert.equal(result[0].assignedShipper, null);
});

// =============================================================================
// UT_SHP_04: getOrderDetail - Xem chi tiết đơn thành công
// =============================================================================
test("UT_SHP_04: getOrderDetail - Xem chi tiết đơn thành công", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    orderCode: "DH100001",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    deliveryAddress: "123 Đường 3/2, Quận 10",
    total: 150000,
    status: ORDER_STATUS.READY_FOR_DELIVERY,
  });

  orderRepository.findByIdWithDetails = async (id) => {
    assert.equal(id, VALID_ORDER_ID);
    return mockOrder;
  };

  const result = await shipperService.getOrderDetail(VALID_ORDER_ID);
  assert.equal(result._id, VALID_ORDER_ID);
  assert.equal(result.orderCode, "DH100001");
  assert.equal(result.customerName, "Nguyễn Văn A");
  assert.equal(result.customerPhone, "0901234567");
  assert.equal(result.deliveryAddress, "123 Đường 3/2, Quận 10");
  assert.equal(result.items.length, 2);
  assert.equal(result.total, 150000);
  assert.equal(result.payment.method, "cod");
  assert.equal(result.status, ORDER_STATUS.READY_FOR_DELIVERY);
});

// =============================================================================
// UT_SHP_05: getOrderDetail - Xem chi tiết thất bại do ID sai định dạng
// =============================================================================
test("UT_SHP_05: getOrderDetail - Xem chi tiết thất bại do ID sai định dạng", async () => {
  await assert.rejects(
    async () => {
      await shipperService.getOrderDetail("invalid-id");
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Mã đơn hàng không hợp lệ/);
      return true;
    },
  );
});

// =============================================================================
// UT_SHP_06: getOrderDetail - Không tìm thấy đơn hàng
// =============================================================================
test("UT_SHP_06: getOrderDetail - Không tìm thấy đơn hàng", async () => {
  orderRepository.findByIdWithDetails = async () => null;

  await assert.rejects(
    async () => {
      await shipperService.getOrderDetail(VALID_ORDER_ID);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy đơn hàng/);
      return true;
    },
  );
});

// =============================================================================
// UT_SHP_07: acceptOrder - Nhận đơn thành công
// =============================================================================
test("UT_SHP_07: acceptOrder - Nhận đơn thành công", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    orderType: "delivery",
    assignedShipper: null,
    statusHistory: [],
  });

  orderRepository.findById = async (id) => mockOrder;
  orderRepository.save = async (order) => order;

  const result = await shipperService.acceptOrder(VALID_ORDER_ID, SHIPPER_A_ID);
  assert.equal(result.status, ORDER_STATUS.DELIVERING);
  assert.equal(result.assignedShipper, SHIPPER_A_ID);
  assert.equal(result.statusHistory.length, 1);
  assert.equal(result.statusHistory[0].status, ORDER_STATUS.DELIVERING);
  assert.equal(result.statusHistory[0].changedBy, SHIPPER_A_ID);
});

// =============================================================================
// UT_SHP_08: acceptOrder - Nhận đơn thất bại vì đơn đã được shipper khác nhận
// =============================================================================
test("UT_SHP_08: acceptOrder - Nhận đơn thất bại vì đơn đã được shipper khác nhận", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    orderType: "delivery",
    assignedShipper: SHIPPER_B_ID,
  });

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await shipperService.acceptOrder(VALID_ORDER_ID, SHIPPER_A_ID);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.ok(err.statusCode === 409 || err.statusCode === 400);
      assert.match(err.message, /đã được shipper khác nhận/);
      return true;
    },
  );
  assert.equal(mockOrder.assignedShipper, SHIPPER_B_ID);
});

// =============================================================================
// UT_SHP_09: acceptOrder - Nhận đơn thất bại vì trạng thái không còn Sẵn sàng giao
// =============================================================================
test("UT_SHP_09: acceptOrder - Nhận đơn thất bại vì trạng thái không còn Sẵn sàng giao", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.DELIVERING,
    orderType: "delivery",
    assignedShipper: null,
  });

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await shipperService.acceptOrder(VALID_ORDER_ID, SHIPPER_A_ID);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Chỉ có thể nhận đơn đã sẵn sàng giao/);
      return true;
    },
  );
});

// =============================================================================
// UT_SHP_10: acceptOrder - Nhận đơn thất bại khi đơn không tồn tại
// =============================================================================
test("UT_SHP_10: acceptOrder - Nhận đơn thất bại khi đơn không tồn tại", async () => {
  orderRepository.findById = async () => null;

  await assert.rejects(
    async () => {
      await shipperService.acceptOrder(VALID_ORDER_ID, SHIPPER_A_ID);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /Không tìm thấy đơn hàng/);
      return true;
    },
  );
});

// =============================================================================
// UT_SHP_11: completeOrder - Xác nhận Đã giao thành công
// =============================================================================
test("UT_SHP_11: completeOrder - Xác nhận Đã giao thành công", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.DELIVERING,
    assignedShipper: SHIPPER_A_ID,
    statusHistory: [],
  });

  orderRepository.findById = async () => mockOrder;
  orderRepository.save = async (order) => order;

  const result = await shipperService.completeOrder(
    VALID_ORDER_ID,
    SHIPPER_A_ID,
  );
  assert.equal(result.status, ORDER_STATUS.COMPLETED);
  assert.ok(result.completedAt instanceof Date);
  assert.equal(result.statusHistory.length, 1);
  assert.equal(result.statusHistory[0].status, ORDER_STATUS.COMPLETED);
  assert.equal(result.statusHistory[0].changedBy, SHIPPER_A_ID);
});

// =============================================================================
// UT_SHP_12: completeOrder - Không cho shipper hoàn thành đơn của người khác
// =============================================================================
test("UT_SHP_12: completeOrder - Không cho shipper hoàn thành đơn của người khác", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.DELIVERING,
    assignedShipper: SHIPPER_B_ID,
  });

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await shipperService.completeOrder(VALID_ORDER_ID, SHIPPER_A_ID);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /không được cập nhật đơn không thuộc về mình/);
      return true;
    },
  );
  assert.equal(mockOrder.status, ORDER_STATUS.DELIVERING);
});

// =============================================================================
// UT_SHP_13: completeOrder - Không cho hoàn thành đơn chưa ở trạng thái Đang giao
// =============================================================================
test("UT_SHP_13: completeOrder - Không cho hoàn thành đơn chưa ở trạng thái Đang giao", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    assignedShipper: SHIPPER_A_ID,
  });

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await shipperService.completeOrder(VALID_ORDER_ID, SHIPPER_A_ID);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Chỉ có thể hoàn thành đơn đang giao/);
      return true;
    },
  );
});

// =============================================================================
// UT_SHP_14: completeOrder - Không hoàn thành lại đơn đã hoàn thành
// =============================================================================
test("UT_SHP_14: completeOrder - Không hoàn thành lại đơn đã hoàn thành", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.COMPLETED,
    assignedShipper: SHIPPER_A_ID,
  });

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await shipperService.completeOrder(VALID_ORDER_ID, SHIPPER_A_ID);
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Chỉ có thể hoàn thành đơn đang giao/);
      return true;
    },
  );
});

// =============================================================================
// UT_SHP_15: failOrder - Cập nhật giao hàng thất bại thành công
// =============================================================================
test("UT_SHP_15: failOrder - Cập nhật giao hàng thất bại thành công", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.DELIVERING,
    assignedShipper: SHIPPER_A_ID,
    statusHistory: [],
  });

  orderRepository.findById = async () => mockOrder;
  orderRepository.save = async (order) => order;

  const result = await shipperService.failOrder(VALID_ORDER_ID, SHIPPER_A_ID, {
    reason: "Khách không nghe máy",
  });

  assert.equal(result.status, ORDER_STATUS.FAILED);
  assert.equal(result.failureReason, "Khách không nghe máy");
  assert.equal(result.statusHistory.length, 1);
  assert.equal(result.statusHistory[0].status, ORDER_STATUS.FAILED);
  assert.equal(result.statusHistory[0].note, "Khách không nghe máy");
});

// =============================================================================
// UT_SHP_16: failOrder - Giao thất bại vì khách từ chối nhận
// =============================================================================
test("UT_SHP_16: failOrder - Giao thất bại vì khách từ chối nhận", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.DELIVERING,
    assignedShipper: SHIPPER_A_ID,
    statusHistory: [],
  });

  orderRepository.findById = async () => mockOrder;
  orderRepository.save = async (order) => order;

  const result = await shipperService.failOrder(VALID_ORDER_ID, SHIPPER_A_ID, {
    reason: "Khách từ chối nhận",
  });

  assert.equal(result.status, ORDER_STATUS.FAILED);
  assert.equal(result.failureReason, "Khách từ chối nhận");
});

// =============================================================================
// UT_SHP_17: failOrder - Không cho cập nhật thất bại khi thiếu lý do
// =============================================================================
test("UT_SHP_17: failOrder - Không cho cập nhật thất bại khi thiếu lý do", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.DELIVERING,
    assignedShipper: SHIPPER_A_ID,
  });

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await shipperService.failOrder(VALID_ORDER_ID, SHIPPER_A_ID, {
        reason: "",
      });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 400);
      assert.match(err.message, /Lý do giao hàng thất bại không được để trống/);
      return true;
    },
  );
});

// =============================================================================
// UT_SHP_18: failOrder - Không cho cập nhật thất bại với đơn không thuộc shipper hiện tại
// =============================================================================
test("UT_SHP_18: failOrder - Không cho cập nhật thất bại với đơn không thuộc shipper hiện tại", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    status: ORDER_STATUS.DELIVERING,
    assignedShipper: SHIPPER_B_ID,
  });

  orderRepository.findById = async () => mockOrder;

  await assert.rejects(
    async () => {
      await shipperService.failOrder(VALID_ORDER_ID, SHIPPER_A_ID, {
        reason: "Khách không nghe máy",
      });
    },
    (err) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /không được cập nhật đơn không thuộc về mình/);
      return true;
    },
  );
});

// =============================================================================
// UT_SHP_19: listDeliveringOrders - Lấy danh sách Đang giao của shipper
// =============================================================================
test("UT_SHP_19: listDeliveringOrders - Lấy danh sách Đang giao của shipper", async () => {
  const mockShippingOrders = [
    createMockOrder({
      _id: "507f1f77bcf86cd799439001",
      orderCode: "DH100001",
      status: ORDER_STATUS.DELIVERING,
      assignedShipper: SHIPPER_A_ID,
    }),
    createMockOrder({
      _id: "507f1f77bcf86cd799439002",
      orderCode: "DH100002",
      status: ORDER_STATUS.DELIVERING,
      assignedShipper: SHIPPER_A_ID,
    }),
    createMockOrder({
      _id: "507f1f77bcf86cd799439003",
      orderCode: "DH100003",
      status: ORDER_STATUS.DELIVERING,
      assignedShipper: SHIPPER_B_ID,
    }),
  ];

  orderRepository.findMany = async (filter) => {
    return mockShippingOrders.filter(
      (o) =>
        o.status === filter.status &&
        o.assignedShipper === filter.assignedShipper,
    );
  };

  const result = await shipperService.listDeliveringOrders(SHIPPER_A_ID);
  assert.equal(result.length, 2);
  assert.equal(result[0].assignedShipper, SHIPPER_A_ID);
  assert.equal(result[1].assignedShipper, SHIPPER_A_ID);
});

// =============================================================================
// UT_SHP_20: listHistory - Xem lịch sử giao hàng thành công
// =============================================================================
test("UT_SHP_20: listHistory - Xem lịch sử giao hàng thành công", async () => {
  const mockHistory = [
    createMockOrder({
      _id: "507f1f77bcf86cd799439001",
      orderCode: "DH100001",
      status: ORDER_STATUS.COMPLETED,
      assignedShipper: SHIPPER_A_ID,
    }),
    createMockOrder({
      _id: "507f1f77bcf86cd799439002",
      orderCode: "DH100002",
      status: ORDER_STATUS.FAILED,
      assignedShipper: SHIPPER_A_ID,
    }),
  ];

  orderRepository.findMany = async (filter) => {
    assert.deepEqual(filter.status.$in, [
      ORDER_STATUS.COMPLETED,
      ORDER_STATUS.FAILED,
    ]);
    assert.equal(filter.assignedShipper, SHIPPER_A_ID);
    return mockHistory;
  };

  const result = await shipperService.listHistory(SHIPPER_A_ID);
  assert.equal(result.length, 2);
  assert.equal(result[0].status, ORDER_STATUS.COMPLETED);
  assert.equal(result[1].status, ORDER_STATUS.FAILED);
});

// =============================================================================
// UT_SHP_21: listHistory - Không hiển thị lịch sử của shipper khác
// =============================================================================
test("UT_SHP_21: listHistory - Không hiển thị lịch sử của shipper khác", async () => {
  const allHistoryOrders = [
    createMockOrder({
      _id: "507f1f77bcf86cd799439001",
      orderCode: "DH100001",
      status: ORDER_STATUS.COMPLETED,
      assignedShipper: SHIPPER_A_ID,
    }),
    createMockOrder({
      _id: "507f1f77bcf86cd799439002",
      orderCode: "DH100002",
      status: ORDER_STATUS.COMPLETED,
      assignedShipper: SHIPPER_B_ID,
    }),
    createMockOrder({
      _id: "507f1f77bcf86cd799439003",
      orderCode: "DH100003",
      status: ORDER_STATUS.FAILED,
      assignedShipper: SHIPPER_B_ID,
    }),
  ];

  orderRepository.findMany = async (filter) => {
    return allHistoryOrders.filter(
      (o) =>
        filter.status.$in.includes(o.status) &&
        o.assignedShipper === filter.assignedShipper,
    );
  };

  const result = await shipperService.listHistory(SHIPPER_A_ID);
  assert.equal(result.length, 1);
  assert.equal(result[0].orderCode, "DH100001");
  assert.equal(result[0].assignedShipper, SHIPPER_A_ID);
});

// =============================================================================
// UT_SHP_22: getOrderDetail - Hiển thị đúng thông tin thanh toán COD
// =============================================================================
test("UT_SHP_22: getOrderDetail - Hiển thị đúng thông tin thanh toán COD", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    total: 150000,
    payment: {
      method: "cod",
      status: "unpaid",
    },
  });

  orderRepository.findByIdWithDetails = async () => mockOrder;

  const order = await shipperService.getOrderDetail(VALID_ORDER_ID);
  assert.equal(order.payment.method, "cod");
  assert.equal(order.payment.status, "unpaid");
  assert.equal(order.total, 150000);

  const needCollect = shipperService.getNeedCollectAmount(order);
  assert.equal(needCollect, 150000);
});

// =============================================================================
// UT_SHP_23: getOrderDetail - Hiển thị đơn đã thanh toán trước
// =============================================================================
test("UT_SHP_23: getOrderDetail - Hiển thị đơn đã thanh toán trước", async () => {
  const mockOrder = createMockOrder({
    _id: VALID_ORDER_ID,
    total: 150000,
    payment: {
      method: "e_wallet",
      status: "paid",
    },
  });

  orderRepository.findByIdWithDetails = async () => mockOrder;

  const order = await shipperService.getOrderDetail(VALID_ORDER_ID);
  assert.equal(order.payment.status, "paid");

  const needCollect = shipperService.getNeedCollectAmount(order);
  assert.equal(needCollect, 0);
});
