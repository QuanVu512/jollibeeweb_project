const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const databaseRepository = require('../repositories/database.repository');
const ApiError = require('../utils/ApiError');
const { ORDER_STATUS } = require('../constants/orderStatus');
const {
  deductIngredientsForOrder,
  restoreIngredientsForOrder,
  calculateAvailablePortionsForProducts,
  checkOrderStockSufficiency
} = require('./inventoryRecipeService');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');

function summarizeMissingRecipes(missingRecipes) {
  if (!missingRecipes || missingRecipes.length === 0) return '';
  const names = missingRecipes.slice(0, 3).map((item) => item.name || item.productCode).join(', ');
  const suffix = missingRecipes.length > 3 ? ` và ${missingRecipes.length - 3} món khác` : '';
  return ` Chưa trừ kho cho món chưa có công thức: ${names}${suffix}.`;
}

function kitchenStatusNote(baseNote, inventoryResult) {
  return `${baseNote}${summarizeMissingRecipes(inventoryResult?.missingRecipes)}`.slice(0, 300);
}

function kitchenResponseMessage(baseMessage, inventoryResult) {
  const missingSummary = summarizeMissingRecipes(inventoryResult?.missingRecipes);
  if (!missingSummary) return baseMessage;
  return `${baseMessage}${missingSummary}`;
}

async function finishPreparingOrder(id, userId, options) {
  let savedOrder;
  let inventoryResult = { deducted: [], missingRecipes: [], alreadyDeducted: false };

  await databaseRepository.transaction(async (session) => {
    const order = await orderRepository.findById(id, session);
    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng.');
    }

    if (order.status !== ORDER_STATUS.PREPARING) {
      throw new ApiError(400, 'Đơn hàng không ở trạng thái đang chế biến.');
    }

    inventoryResult = await deductIngredientsForOrder(order, userId, { session });

    order.status = options.status;
    order.preparedBy = userId;
    if (options.status === ORDER_STATUS.COMPLETED) {
      order.completedAt = new Date();
    }
    if (!order.inventoryDeductedAt) {
      order.inventoryDeductedAt = new Date();
      order.inventoryDeductedBy = userId;
    }

    order.statusHistory.push({
      status: options.status,
      changedBy: userId,
      note: kitchenStatusNote(options.note, inventoryResult)
    });

    await orderRepository.save(order, { session });
    savedOrder = order;
  });

  return {
    message: kitchenResponseMessage(options.message, inventoryResult),
    order: savedOrder,
    inventory: inventoryResult
  };
}

async function getProducts() {
  const items = await productRepository.findActive();
  const productCodes = items.map(p => p.productCode).filter(Boolean);
  const portionsMap = await calculateAvailablePortionsForProducts(productCodes, 'dine_in');

  return items.map(item => {
    const obj = item.toObject ? item.toObject() : { ...item };
    const portions = portionsMap[item.productCode];
    obj.availableServings = portions !== undefined ? portions : null;
    return obj;
  });
}

async function createOrder(body, userId) {
  const {
    customerName,
    customerPhone,
    orderType,
    deliveryAddress,
    items,
    source,
    branchCode,
    subtotal,
    shippingFee,
    discount,
    total
  } = body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Đơn hàng phải có ít nhất một món ăn.');
  }

  // 1. Kiểm tra số lượng món không âm và là số nguyên dương lớn hơn 0
  for (const item of items) {
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ApiError(400, 'Số lượng món ăn phải là số nguyên dương lớn hơn 0.');
    }
  }

  const isWeb = source === 'web';

  // 2. Bắt buộc chọn bàn và phải là số không âm (cho đơn tạo tại quầy)
  let tableNum = '';
  if (!isWeb) {
    const rawTable = body.tableNumber !== undefined && body.tableNumber !== null && String(body.tableNumber).trim() !== ''
      ? body.tableNumber
      : (orderType === 'dine_in' ? deliveryAddress : '');

    if (rawTable === undefined || rawTable === null || String(rawTable).trim() === '') {
      throw new ApiError(400, 'Vui lòng nhập số bàn (bắt buộc).');
    }

    const parsedTable = Number(rawTable);
    if (isNaN(parsedTable) || parsedTable < 0) {
      throw new ApiError(400, 'Số bàn phải là số không âm.');
    }
    tableNum = String(parsedTable);
  } else {
    tableNum = body.tableNumber || '';
  }

  // 3. Kiểm tra số bàn không được trùng với đơn đang hoạt động (chưa hoàn tất hoặc chưa hủy)
  if (tableNum && orderType !== 'delivery') {
    const existingOrder = await orderRepository.findOne({
      $or: [
        { tableNumber: tableNum },
        { tableNumber: `Bàn ${tableNum}` },
        { tableNumber: `Bàn 0${tableNum}` }
      ],
      orderType: { $ne: 'delivery' },
      status: { $nin: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED] }
    });
    if (existingOrder) {
      throw new ApiError(400, `Bàn số ${tableNum} hiện đang có đơn hàng (#${existingOrder.orderCode}) chưa hoàn tất. Vui lòng chọn số bàn khác.`);
    }
  }

  const populatedItems = [];
  let calculatedTotal = 0;

  for (const item of items) {
    const productId = item.productId || item.product;
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new ApiError(404, `Không tìm thấy sản phẩm với ID: ${productId}`);
    }

    const quantity = Number(item.quantity) || 1;
    const lineTotal = quantity * product.price;
    calculatedTotal += lineTotal;

    populatedItems.push({
      product: product._id,
      productCode: product.productCode,
      categoryCode: product.categoryCode || '',
      name: product.name,
      quantity,
      unitPrice: product.price,
      costPrice: product.costPrice || 0,
      lineTotal
    });
  }

  // Chuyển đơn sang trạng thái PENDING để đưa sang màn hình chờ xác nhận
  const orderStatus = ORDER_STATUS.PENDING;
  const isInvoicePrinted = false; // Bỏ in hoá đơn sau tạo đơn
  const rawPaymentMethod = body.paymentMethod || body.payment?.method || (isWeb ? 'cod' : 'cash');
  const paymentMethod = rawPaymentMethod === 'qr' ? 'e_wallet' : rawPaymentMethod;

  const order = orderRepository.createDocument({
    customerName: customerName || (isWeb ? 'Khách Web' : 'Khách lẻ'),
    customerPhone: isWeb ? (customerPhone || '') : '',
    orderedAt: new Date(),
    orderType: isWeb ? (orderType || 'delivery') : 'dine_in',
    tableNumber: tableNum,
    deliveryAddress: isWeb ? (deliveryAddress || '') : `Bàn ${tableNum}`,
    isInvoicePrinted,
    invoicePrintedAt: null,
    notes: body.notes || '',
    items: populatedItems,
    status: orderStatus,
    source: isWeb ? 'web' : 'pos',
    branchCode: branchCode || 'MAIN',
    subtotal: subtotal || calculatedTotal,
    shippingFee: shippingFee || 0,
    discount: discount || 0,
    total: total || calculatedTotal,
    createdBy: userId
  });

  if (isWeb) {
    order.payment = {
      method: paymentMethod,
      status: 'unpaid',
      transactionReference: ''
    };
    order.statusHistory = [{
      status: ORDER_STATUS.PENDING,
      note: 'Khách đặt đơn từ Website'
    }];
  } else {
    order.payment = {
      method: paymentMethod,
      status: 'unpaid',
      paidAt: null,
      transactionReference: body.transactionReference || ''
    };
    order.statusHistory = [{
      status: ORDER_STATUS.PENDING,
      changedBy: userId,
      note: `Tạo đơn tại quầy cho Bàn ${tableNum}`
    }];
  }

  await databaseRepository.transaction(async (session) => {
    await order.validate();
    // Kiểm tra nguyên liệu trong kho: nếu thiếu thì báo chỉ còn bao nhiêu suất
    await checkOrderStockSufficiency(order, session);
    await orderRepository.save(order, { session });
  });

  return {
    message: isWeb
      ? 'Đặt hàng thành công! Vui lòng chờ nhà hàng xác nhận đơn.'
      : 'Đặt món thành công! Đơn hàng đã được chuyển sang màn hình chờ xác nhận.',
    order
  };
}

function getPendingOrders() {
  return orderRepository.findMany(
    { status: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING] }, orderType: { $ne: 'pickup' } },
    { sort: { orderedAt: 1, createdAt: 1 }, populate: { path: 'createdBy', select: 'username displayName' } }
  );
}

function getPreparingOrders() {
  return orderRepository.findMany(
    { status: ORDER_STATUS.PREPARING, orderType: { $ne: 'pickup' } },
    { sort: { orderedAt: 1, createdAt: 1 }, populate: { path: 'createdBy', select: 'username displayName' } }
  );
}

async function acceptOrder(id, userId) {
  let savedOrder;
  let inventoryResult;

  await databaseRepository.transaction(async (session) => {
    const order = await orderRepository.findById(id, session);
    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng.');
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new ApiError(400, 'Đơn hàng này không ở trạng thái chờ duyệt.');
    }

    inventoryResult = await deductIngredientsForOrder(order, userId, { session });
    order.status = ORDER_STATUS.PREPARING;
    order.isInvoicePrinted = true;
    order.invoicePrintedAt = new Date();
    if (order.payment) {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }
    if (!order.inventoryDeductedAt) {
      order.inventoryDeductedAt = new Date();
      order.inventoryDeductedBy = userId;
    }

    order.statusHistory.push({
      status: ORDER_STATUS.PREPARING,
      changedBy: userId,
      note: kitchenStatusNote('Thu ngân xác nhận đơn và in hóa đơn chuyển xuống bếp', inventoryResult)
    });

    await orderRepository.save(order, { session });
    savedOrder = order;
  });

  return {
    message: kitchenResponseMessage('Đã duyệt đơn hàng và chuyển xuống bếp.', inventoryResult),
    order: savedOrder,
    inventory: inventoryResult
  };
}

async function verifyAdminPassword(password) {
  if (!password || typeof password !== 'string') return false;
  const adminUsers = await User.find({ role: ROLES.ADMIN, isActive: true }).select('+passwordHash');
  for (const admin of adminUsers) {
    if (admin.passwordHash) {
      const isMatch = await admin.comparePassword(password);
      if (isMatch) return true;
    }
  }
  return false;
}

async function getPosOrders(query = {}) {
  const filter = {};
  if (query.orderType) {
    filter.orderType = query.orderType;
  }
  if (query.status) {
    filter.status = query.status;
  }
  return orderRepository.findMany(
    filter,
    { sort: { orderedAt: -1 }, populate: { path: 'createdBy', select: 'username displayName' } }
  );
}

async function getOrderDetails(id) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  }
  return order;
}

async function cancelOrder(id, body = {}, userId, userRole) {
  let savedOrder;
  const reason = body.reason || 'Thu ngân hủy đơn hàng';

  await databaseRepository.transaction(async (session) => {
    const order = await orderRepository.findById(id, session);
    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng.');
    }

    if (order.status === ORDER_STATUS.COMPLETED) {
      throw new ApiError(400, 'Đơn hàng đã hoàn tất, không thể hủy.');
    }
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new ApiError(400, 'Đơn hàng này đã bị hủy trước đó.');
    }

    // Luồng phụ theo sơ đồ Hình 3.51 & 3.52: Nếu đơn đã in hóa đơn tài chính -> Yêu cầu quyền Quản trị viên
    const isPrinted = Boolean(order.isInvoicePrinted || order.status === ORDER_STATUS.PREPARING);
    if (isPrinted) {
      const isUserAdmin = userRole === ROLES.ADMIN;
      const isAdminPasswordValid = body.adminPassword ? await verifyAdminPassword(body.adminPassword) : false;
      if (!isUserAdmin && !isAdminPasswordValid) {
        throw new ApiError(403, 'Đơn hàng đã xuất hóa đơn tài chính. Yêu cầu xác thực Quản trị viên (Admin) để hủy đơn!');
      }
    }

    // Hoàn lại kho nguyên liệu nếu đã trừ kho
    if (order.inventoryDeductedAt) {
      await restoreIngredientsForOrder(order, userId, {
        session,
        note: `Hoàn kho do hủy đơn ${order.orderCode} (${reason})`
      });
    }

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: ORDER_STATUS.CANCELLED,
      changedBy: userId,
      note: `Hủy đơn hàng: ${reason}`
    });

    await orderRepository.save(order, { session });
    savedOrder = order;
  });

  return savedOrder;
}

async function updateOrder(id, body = {}, userId, userRole) {
  let savedOrder;
  let inventoryResult = { deducted: [], missingRecipes: [] };

  await databaseRepository.transaction(async (session) => {
    const order = await orderRepository.findById(id, session);
    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng.');
    }

    if (order.status === ORDER_STATUS.COMPLETED) {
      throw new ApiError(400, 'Đơn hàng đã hoàn tất, không thể chỉnh sửa.');
    }
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new ApiError(400, 'Đơn hàng đã bị hủy, không thể chỉnh sửa.');
    }

    // Luồng phụ theo sơ đồ Hình 3.49 & 3.50: Nếu đơn đã in hóa đơn tài chính -> Yêu cầu quyền Quản trị viên
    const isPrinted = Boolean(order.isInvoicePrinted || order.status === ORDER_STATUS.PREPARING);
    if (isPrinted) {
      const isUserAdmin = userRole === ROLES.ADMIN;
      const isAdminPasswordValid = body.adminPassword ? await verifyAdminPassword(body.adminPassword) : false;
      if (!isUserAdmin && !isAdminPasswordValid) {
        throw new ApiError(403, 'Đơn hàng đã xuất hóa đơn tài chính. Yêu cầu quyền Quản trị viên (Admin) để chỉnh sửa.');
      }
    }

    // Cập nhật danh sách món nếu có
    if (body.items && Array.isArray(body.items)) {
      if (body.items.length === 0) {
        throw new ApiError(400, 'Đơn hàng phải có ít nhất một món ăn.');
      }

      // 1. Hoàn lại kho nguyên liệu cũ nếu trước đó đã trừ kho
      if (order.inventoryDeductedAt) {
        await restoreIngredientsForOrder(order, userId, {
          session,
          note: `Hoàn kho tạm thời để cập nhật lại món đơn ${order.orderCode}`
        });
      }

      // 2. Tính lại chi tiết món mới
      const populatedItems = [];
      let calculatedTotal = 0;

      for (const item of body.items) {
        const productId = item.productId || item.product;
        const product = await productRepository.findById(productId, session);
        if (!product) {
          throw new ApiError(404, `Không tìm thấy sản phẩm: ${productId}`);
        }

        const quantity = Number(item.quantity) || 1;
        const lineTotal = quantity * product.price;
        calculatedTotal += lineTotal;

        populatedItems.push({
          product: product._id,
          productCode: product.productCode,
          categoryCode: product.categoryCode || '',
          name: product.name,
          quantity,
          unitPrice: product.price,
          costPrice: product.costPrice || 0,
          lineTotal
        });
      }

      order.items = populatedItems;
      order.subtotal = calculatedTotal;
      order.discount = Number(body.discount !== undefined ? body.discount : order.discount) || 0;
      order.shippingFee = Number(body.shippingFee !== undefined ? body.shippingFee : order.shippingFee) || 0;
      order.total = Math.max(0, order.subtotal + order.shippingFee - order.discount);

      // 3. Trừ lại nguyên liệu kho theo danh sách món mới
      inventoryResult = await deductIngredientsForOrder(order, userId, { session });
      order.inventoryDeductedAt = new Date();
      order.inventoryDeductedBy = userId;
    }

    if (body.tableNumber !== undefined && order.orderType !== 'delivery') {
      const rawTable = body.tableNumber;
      if (rawTable !== null && String(rawTable).trim() !== '') {
        const parsedTable = Number(rawTable);
        if (isNaN(parsedTable) || parsedTable < 0) {
          throw new ApiError(400, 'Số bàn phải là số không âm.');
        }
        const newTableNum = String(parsedTable);
        const existingOrder = await orderRepository.findOne({
          _id: { $ne: order._id },
          $or: [
            { tableNumber: newTableNum },
            { tableNumber: `Bàn ${newTableNum}` },
            { tableNumber: `Bàn 0${newTableNum}` }
          ],
          orderType: { $ne: 'delivery' },
          status: { $nin: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED] }
        }, { session });

        if (existingOrder) {
          throw new ApiError(400, `Bàn số ${newTableNum} hiện đang có đơn hàng (#${existingOrder.orderCode}) chưa hoàn tất. Vui lòng chọn số bàn khác.`);
        }
        order.tableNumber = newTableNum;
        order.deliveryAddress = newTableNum;
      }
    }
    if (body.deliveryAddress !== undefined) {
      order.deliveryAddress = body.deliveryAddress;
    }
    if (body.customerName !== undefined) {
      order.customerName = body.customerName;
    }
    if (body.customerPhone !== undefined) {
      order.customerPhone = body.customerPhone;
    }
    if (body.notes !== undefined) {
      order.notes = body.notes;
    }
    if (body.paymentMethod) {
      order.payment.method = body.paymentMethod;
    }

    order.statusHistory.push({
      status: order.status,
      changedBy: userId,
      note: `Thu ngân cập nhật đơn hàng${body.notes ? ': ' + body.notes : ''}`
    });

    await orderRepository.save(order, { session });
    savedOrder = order;
  });

  return {
    message: 'Cập nhật đơn hàng thành công.',
    order: savedOrder,
    inventory: inventoryResult
  };
}

async function printInvoice(id, userId) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  }

  order.isInvoicePrinted = true;
  order.invoicePrintedAt = new Date();
  if (order.source === 'pos' && order.payment && order.payment.status === 'unpaid') {
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
  }

  order.statusHistory.push({
    status: order.status,
    changedBy: userId,
    note: 'In hóa đơn thanh toán tại quầy'
  });

  await orderRepository.save(order);
  return order;
}

function serveOrder(id, userId) {
  return finishPreparingOrder(id, userId, {
    status: ORDER_STATUS.COMPLETED,
    note: 'Bếp hoàn thành chế biến và phục vụ tại bàn',
    message: 'Đơn hàng đã được phục vụ.'
  });
}

function readyOrder(id, userId) {
  return finishPreparingOrder(id, userId, {
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    note: 'Bếp hoàn thành chế biến, chờ giao hàng',
    message: 'Đơn hàng đã sẵn sàng giao.'
  });
}

module.exports = {
  getProducts,
  createOrder,
  getPendingOrders,
  getPreparingOrders,
  getPosOrders,
  getOrderDetails,
  acceptOrder,
  cancelOrder,
  updateOrder,
  printInvoice,
  verifyAdminPassword,
  serveOrder,
  readyOrder
};
