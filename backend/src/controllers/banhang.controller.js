const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");
const { ORDER_STATUS } = require("../constants/orderStatus");
const { config } = require("../config/env");
const { deductIngredientsForOrder } = require("../services/inventoryRecipeService");

function summarizeMissingRecipes(missingRecipes) {
  if (!missingRecipes || missingRecipes.length === 0) return "";
  const names = missingRecipes.slice(0, 3).map(item => item.name || item.productCode).join(", ");
  const suffix = missingRecipes.length > 3 ? ` và ${missingRecipes.length - 3} món khác` : "";
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

async function finishPreparingOrder(req, res, options) {
  let savedOrder;
  let inventoryResult = { deducted: [], missingRecipes: [], alreadyDeducted: false };

  await mongoose.connection.transaction(async (session) => {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      throw new ApiError(404, "Không tìm thấy đơn hàng.");
    }

    if (order.status !== ORDER_STATUS.PREPARING) {
      throw new ApiError(400, "Đơn hàng không ở trạng thái đang chế biến.");
    }

    inventoryResult = await deductIngredientsForOrder(order, req.user._id, { session });

    order.status = options.status;
    order.preparedBy = req.user._id;
    if (!order.inventoryDeductedAt) {
      order.inventoryDeductedAt = new Date();
      order.inventoryDeductedBy = req.user._id;
    }

    order.statusHistory.push({
      status: options.status,
      changedBy: req.user._id,
      note: kitchenStatusNote(options.note, inventoryResult)
    });

    await order.save({ session });
    savedOrder = order;
  });

  res.json({
    success: true,
    message: kitchenResponseMessage(options.message, inventoryResult),
    data: { order: savedOrder, inventory: inventoryResult }
  });
}

async function getProducts(req, res) {
  const items = await Product.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, data: { items } });
}

async function createOrder(req, res) {
  
  const { customerName, customerPhone, orderType, deliveryAddress, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Đơn hàng phải có ít nhất một món ăn.");
  }

  const populatedItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new ApiError(404, `Không tìm thấy sản phẩm với ID: ${item.productId}`);
    }

    if (req.body.source === "web") {
    const Order = mongoose.model("Order");
    
    const newOrder = new Order({
      customerName: req.body.customerName,
      customerPhone: req.body.customerPhone,
      deliveryAddress: req.body.deliveryAddress,
      orderType: req.body.orderType || "delivery",
      source: "web",
      branchCode: req.body.branchCode || "MAIN",
      status: "pending", 
      items: req.body.items,
      subtotal: req.body.subtotal,
      shippingFee: req.body.shippingFee || 0,
      discount: req.body.discount || 0,
      total: req.body.total,
      payment: {
        method: "cod",
        status: "unpaid",
        transactionReference: ""
      },
      statusHistory: [{
        status: "pending",
        note: "Khách đặt đơn từ Website"
      }]
    });

    await newOrder.save();
    return res.json({
      success: true,
      message: "Đặt hàng thành công! Vui lòng chờ thu ngân xác nhận đơn.",
      data: { order: newOrder }
    });
  }

    populatedItems.push({
      product: product._id,
      productCode: product.productCode,
      categoryCode: product.categoryCode || "",
      name: product.name,
      quantity: Number(item.quantity) || 1,
      unitPrice: product.price,
      costPrice: product.costPrice || 0,
      lineTotal: (Number(item.quantity) || 1) * product.price
    });
  }

  const order = new Order({
    customerName: customerName || "Khách lẻ",
    customerPhone: customerPhone || "",
    orderType: orderType || "dine_in",
    deliveryAddress: deliveryAddress || "",
    items: populatedItems,
    status: ORDER_STATUS.PREPARING,
    source: "pos",
    createdBy: req.user._id
  });

  let inventoryResult;
  await mongoose.connection.transaction(async (session) => {
    await order.validate();
    inventoryResult = await deductIngredientsForOrder(order, req.user._id, { session });
    order.inventoryDeductedAt = new Date();
    order.inventoryDeductedBy = req.user._id;
    if (order.statusHistory && order.statusHistory.length > 0) {
      order.statusHistory[0].note = kitchenStatusNote(order.statusHistory[0].note || "Tạo đơn tại quầy", inventoryResult);
    }
    await order.save({ session });
  });

  res.status(201).json({
    success: true,
    message: kitchenResponseMessage("Tạo đơn hàng tại quầy thành công.", inventoryResult),
    data: { order, inventory: inventoryResult }
  });
}

async function getPendingOrders(req, res) {
  const items = await Order.find({ status: ORDER_STATUS.PENDING })
    .populate("createdBy", "username displayName")
    .sort({ orderedAt: 1 });

  res.json({ success: true, data: { items } });
}

async function getPreparingOrders(req, res) {
  const items = await Order.find({ status: ORDER_STATUS.PREPARING })
    .populate("createdBy", "username displayName")
    .sort({ orderedAt: 1 });

  res.json({ success: true, data: { items } });
}

async function acceptOrder(req, res) {
  let savedOrder;
  let inventoryResult;

  await mongoose.connection.transaction(async (session) => {
    const order = await Order.findById(req.params.id).session(session);
    if (!order) {
      throw new ApiError(404, "Không tìm thấy đơn hàng.");
    }

    if (order.status !== ORDER_STATUS.PENDING) {
      throw new ApiError(400, "Đơn hàng này không ở trạng thái chờ duyệt.");
    }

    inventoryResult = await deductIngredientsForOrder(order, req.user._id, { session });
    order.status = ORDER_STATUS.PREPARING;
    if (!order.inventoryDeductedAt) {
      order.inventoryDeductedAt = new Date();
      order.inventoryDeductedBy = req.user._id;
    }
    
    order.statusHistory.push({
      status: ORDER_STATUS.PREPARING,
      changedBy: req.user._id,
      note: kitchenStatusNote("Thu ngân chấp nhận đơn hàng chuyển xuống bếp", inventoryResult)
    });

    await order.save({ session });
    savedOrder = order;
  });

  res.json({
    success: true,
    message: kitchenResponseMessage("Đã duyệt đơn hàng và chuyển xuống bếp.", inventoryResult),
    data: { order: savedOrder, inventory: inventoryResult }
  });
}

async function cancelOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  const reason = req.body.reason || "Thu ngân hủy đơn hàng";
  
  order.status = ORDER_STATUS.CANCELLED;
  order.cancellationReason = reason;
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELLED,
    changedBy: req.user._id,
    note: reason
  });

  await order.save();

  res.json({
    success: true,
    message: "Đã hủy đơn hàng.",
    data: { order }
  });
}

async function serveOrder(req, res) {
  return finishPreparingOrder(req, res, {
    status: ORDER_STATUS.COMPLETED,
    note: "Bếp hoàn thành chế biến và phục vụ tại bàn",
    message: "Đơn hàng đã được phục vụ."
  });
}

async function readyOrder(req, res) {
  return finishPreparingOrder(req, res, {
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    note: "Bếp hoàn thành chế biến, chờ giao hàng",
    message: "Đơn hàng đã sẵn sàng giao."
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
