const mongoose = require("mongoose");
const Order = require("../models/Order");
const ApiError = require("../utils/ApiError");
const { ORDER_STATUS } = require("../constants/orderStatus");

function validateOrderId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Mã đơn hàng không hợp lệ.");
  }
}

function addStatusHistory(order, status, userId, note) {
  order.statusHistory.push({
    status,
    changedBy: userId || null,
    note,
  });
}

async function getNewOrders(_req, res) {
  const items = await Order.find({
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    orderType: "delivery",
  }).sort({ orderedAt: -1 });

  res.json({
    success: true,
    data: { items },
  });
}

async function getShippingOrders(req, res) {
  const items = await Order.find({
    status: ORDER_STATUS.DELIVERING,
    assignedShipper: req.user._id,
  }).sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: { items },
  });
}

async function getHistoryOrders(req, res) {
  const items = await Order.find({
    status: {
      $in: [ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED],
    },
    assignedShipper: req.user._id,
  }).sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: { items },
  });
}

async function getOrderDetail(req, res) {
  validateOrderId(req.params.id);

  const order = await Order.findById(req.params.id)
    .populate("customer", "fullName phone address")
    .populate("assignedShipper", "username displayName role");

  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  res.json({
    success: true,
    data: { order },
  });
}

async function acceptOrder(req, res) {
  validateOrderId(req.params.id);

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  if (order.orderType !== "delivery") {
    throw new ApiError(400, "Chỉ có thể nhận đơn giao hàng.");
  }

  if (order.status !== ORDER_STATUS.READY_FOR_DELIVERY) {
    throw new ApiError(400, "Chỉ có thể nhận đơn đã sẵn sàng giao.");
  }

  order.status = ORDER_STATUS.DELIVERING;
  order.assignedShipper = req.user._id;

  addStatusHistory(
    order,
    ORDER_STATUS.DELIVERING,
    req.user._id,
    "Shipper đã nhận đơn giao hàng",
  );

  await order.save();

  res.json({
    success: true,
    message: "Đã nhận đơn giao hàng.",
    data: { order },
  });
}

async function completeOrder(req, res) {
  validateOrderId(req.params.id);

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  if (order.status !== ORDER_STATUS.DELIVERING) {
    throw new ApiError(400, "Chỉ có thể hoàn thành đơn đang giao.");
  }

  if (order.assignedShipper?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Bạn không được cập nhật đơn không thuộc về mình.");
  }

  order.status = ORDER_STATUS.COMPLETED;
  order.completedAt = new Date();

  addStatusHistory(
    order,
    ORDER_STATUS.COMPLETED,
    req.user._id,
    "Shipper giao hàng thành công",
  );

  await order.save();

  res.json({
    success: true,
    message: "Đơn hàng đã giao thành công.",
    data: { order },
  });
}

async function failOrder(req, res) {
  validateOrderId(req.params.id);

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  if (order.status !== ORDER_STATUS.DELIVERING) {
    throw new ApiError(400, "Chỉ có thể báo thất bại với đơn đang giao.");
  }

  if (order.assignedShipper?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Bạn không được cập nhật đơn không thuộc về mình.");
  }

  const reason = req.body.reason || "Giao hàng thất bại";

  order.status = ORDER_STATUS.FAILED;
  order.failureReason = reason;

  addStatusHistory(order, ORDER_STATUS.FAILED, req.user._id, reason);

  await order.save();

  res.json({
    success: true,
    message: "Đã cập nhật đơn giao thất bại.",
    data: { order },
  });
}

async function cancelOrder(req, res) {
  validateOrderId(req.params.id);

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  if (order.status !== ORDER_STATUS.DELIVERING) {
    throw new ApiError(400, "Chỉ có thể hủy nhận đơn đang giao.");
  }

  if (order.assignedShipper?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Bạn không được hủy đơn không thuộc về mình.");
  }

  order.status = ORDER_STATUS.READY_FOR_DELIVERY;
  order.assignedShipper = null;

  addStatusHistory(
    order,
    ORDER_STATUS.READY_FOR_DELIVERY,
    req.user._id,
    "Shipper hủy nhận đơn",
  );

  await order.save();

  res.json({
    success: true,
    message: "Đã hủy nhận đơn.",
    data: { order },
  });
}

module.exports = {
  getNewOrders,
  getShippingOrders,
  getHistoryOrders,
  getOrderDetail,
  acceptOrder,
  completeOrder,
  failOrder,
  cancelOrder,
};
