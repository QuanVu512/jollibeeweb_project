const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const databaseRepository = require('../repositories/database.repository');
const ApiError = require('../utils/ApiError');
const { ORDER_STATUS } = require('../constants/orderStatus');
const { deductIngredientsForOrder } = require('./inventoryRecipeService');

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

function getProducts() {
  return productRepository.findActive();
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

  const isWeb = source === 'web';
  const orderStatus = isWeb ? ORDER_STATUS.PENDING : ORDER_STATUS.PREPARING;

  const order = orderRepository.createDocument({
    customerName: customerName || (isWeb ? 'Khách Web' : 'Khách lẻ'),
    customerPhone: customerPhone || '',
    orderType: orderType || (isWeb ? 'delivery' : 'dine_in'),
    deliveryAddress: deliveryAddress || '',
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
      method: 'cod',
      status: 'unpaid',
      transactionReference: ''
    };
    order.statusHistory = [{
      status: ORDER_STATUS.PENDING,
      note: 'Khách đặt đơn từ Website'
    }];
  } else {
    order.statusHistory = [{
      status: ORDER_STATUS.PREPARING,
      note: 'Tạo đơn tại quầy'
    }];
  }

  let inventoryResult;
  await databaseRepository.transaction(async (session) => {
    await order.validate();
    inventoryResult = await deductIngredientsForOrder(order, userId, { session });

    order.inventoryDeductedAt = new Date();
    if (userId) order.inventoryDeductedBy = userId;

    if (order.statusHistory && order.statusHistory.length > 0) {
      order.statusHistory[0].note = kitchenStatusNote(order.statusHistory[0].note, inventoryResult);
    }

    await orderRepository.save(order, { session });
  });

  return {
    message: isWeb
      ? 'Đặt hàng thành công! Vui lòng chờ nhà hàng xác nhận đơn.'
      : kitchenResponseMessage('Tạo đơn hàng tại quầy thành công.', inventoryResult),
    order,
    inventory: inventoryResult
  };
}

function getPendingOrders() {
  return orderRepository.findMany(
    { status: ORDER_STATUS.PENDING },
    { sort: { orderedAt: 1 }, populate: { path: 'createdBy', select: 'username displayName' } }
  );
}

function getPreparingOrders() {
  return orderRepository.findMany(
    { status: ORDER_STATUS.PREPARING },
    { sort: { orderedAt: 1 }, populate: { path: 'createdBy', select: 'username displayName' } }
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
    if (!order.inventoryDeductedAt) {
      order.inventoryDeductedAt = new Date();
      order.inventoryDeductedBy = userId;
    }

    order.statusHistory.push({
      status: ORDER_STATUS.PREPARING,
      changedBy: userId,
      note: kitchenStatusNote('Thu ngân chấp nhận đơn hàng chuyển xuống bếp', inventoryResult)
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

async function cancelOrder(id, body, userId) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  }

  const reason = body.reason || 'Thu ngân hủy đơn hàng';

  order.status = ORDER_STATUS.CANCELLED;
  order.cancellationReason = reason;
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELLED,
    changedBy: userId,
    note: reason
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
  acceptOrder,
  cancelOrder,
  serveOrder,
  readyOrder
};
