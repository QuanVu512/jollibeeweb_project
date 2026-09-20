const orderRepository = require('../repositories/order.repository');
const databaseRepository = require('../repositories/database.repository');
const ApiError = require('../utils/ApiError');
const { ORDER_STATUS } = require('../constants/orderStatus');

function validateOrderId(id) {
  if (!databaseRepository.isValidObjectId(id)) {
    throw new ApiError(400, 'Mã đơn hàng không hợp lệ.');
  }
}

function addStatusHistory(order, status, userId, note) {
  order.statusHistory.push({
    status,
    changedBy: userId || null,
    note
  });
}

function getNewOrders() {
  return orderRepository.findMany({
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    orderType: 'delivery'
  }, { sort: { orderedAt: -1 } });
}

function getShippingOrders(userId) {
  return orderRepository.findMany({
    status: ORDER_STATUS.DELIVERING,
    assignedShipper: userId
  }, { sort: { updatedAt: -1 } });
}

function getHistoryOrders(userId) {
  return orderRepository.findMany({
    status: {
      $in: [ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED]
    },
    assignedShipper: userId
  }, { sort: { updatedAt: -1 } });
}

async function getOrderDetail(id) {
  validateOrderId(id);

  const order = await orderRepository.findByIdWithDetails(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  }

  return order;
}

async function acceptOrder(id, userId) {
  validateOrderId(id);

  const order = await orderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  }
  if (order.orderType !== 'delivery') {
    throw new ApiError(400, 'Chỉ có thể nhận đơn giao hàng.');
  }
  if (order.status !== ORDER_STATUS.READY_FOR_DELIVERY) {
    throw new ApiError(400, 'Chỉ có thể nhận đơn đã sẵn sàng giao.');
  }

  order.status = ORDER_STATUS.DELIVERING;
  order.assignedShipper = userId;
  addStatusHistory(order, ORDER_STATUS.DELIVERING, userId, 'Shipper đã nhận đơn giao hàng');
  await orderRepository.save(order);

  return order;
}

async function completeOrder(id, userId) {
  validateOrderId(id);

  const order = await orderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  }
  if (order.status !== ORDER_STATUS.DELIVERING) {
    throw new ApiError(400, 'Chỉ có thể hoàn thành đơn đang giao.');
  }
  if (order.assignedShipper?.toString() !== userId.toString()) {
    throw new ApiError(403, 'Bạn không được cập nhật đơn không thuộc về mình.');
  }

  order.status = ORDER_STATUS.COMPLETED;
  order.completedAt = new Date();
  addStatusHistory(order, ORDER_STATUS.COMPLETED, userId, 'Shipper giao hàng thành công');
  await orderRepository.save(order);

  return order;
}

async function failOrder(id, userId, body) {
  validateOrderId(id);

  const order = await orderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  }
  if (order.status !== ORDER_STATUS.DELIVERING) {
    throw new ApiError(400, 'Chỉ có thể báo thất bại với đơn đang giao.');
  }
  if (order.assignedShipper?.toString() !== userId.toString()) {
    throw new ApiError(403, 'Bạn không được cập nhật đơn không thuộc về mình.');
  }

  const reason = body.reason || 'Giao hàng thất bại';
  order.status = ORDER_STATUS.FAILED;
  order.failureReason = reason;
  addStatusHistory(order, ORDER_STATUS.FAILED, userId, reason);
  await orderRepository.save(order);

  return order;
}

async function cancelOrder(id, userId) {
  validateOrderId(id);

  const order = await orderRepository.findById(id);
  if (!order) {
    throw new ApiError(404, 'Không tìm thấy đơn hàng.');
  }
  if (order.status !== ORDER_STATUS.DELIVERING) {
    throw new ApiError(400, 'Chỉ có thể hủy nhận đơn đang giao.');
  }
  if (order.assignedShipper?.toString() !== userId.toString()) {
    throw new ApiError(403, 'Bạn không được hủy đơn không thuộc về mình.');
  }

  order.status = ORDER_STATUS.READY_FOR_DELIVERY;
  order.assignedShipper = null;
  addStatusHistory(order, ORDER_STATUS.READY_FOR_DELIVERY, userId, 'Shipper hủy nhận đơn');
  await orderRepository.save(order);

  return order;
}

module.exports = {
  getNewOrders,
  getShippingOrders,
  getHistoryOrders,
  getOrderDetail,
  acceptOrder,
  completeOrder,
  failOrder,
  cancelOrder
};
