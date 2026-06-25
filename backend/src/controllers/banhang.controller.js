const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");
const { ORDER_STATUS } = require("../constants/orderStatus");
const { config } = require("../config/env");

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

  // Đơn hàng tại quầy đi thẳng vào bếp chế biến
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

  await order.save();

  res.status(201).json({
    success: true,
    message: "Tạo đơn hàng tại quầy thành công.",
    data: { order }
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
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  if (order.status !== ORDER_STATUS.PENDING) {
    throw new ApiError(400, "Đơn hàng này không ở trạng thái chờ duyệt.");
  }

  order.status = ORDER_STATUS.PREPARING;
  order.statusHistory.push({
    status: ORDER_STATUS.PREPARING,
    changedBy: req.user._id,
    note: "Thu ngân chấp nhận đơn hàng chuyển xuống bếp"
  });

  await order.save();

  res.json({
    success: true,
    message: "Đã duyệt đơn hàng và chuyển xuống bếp.",
    data: { order }
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
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  if (order.status !== ORDER_STATUS.PREPARING) {
    throw new ApiError(400, "Đơn hàng không ở trạng thái đang chế biến.");
  }

  order.status = ORDER_STATUS.COMPLETED;
  order.statusHistory.push({
    status: ORDER_STATUS.COMPLETED,
    changedBy: req.user._id,
    note: "Bếp hoàn thành chế biến và phục vụ tại bàn"
  });

  await order.save();

  res.json({
    success: true,
    message: "Đơn hàng đã được phục vụ.",
    data: { order }
  });
}

async function readyOrder(req, res) {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, "Không tìm thấy đơn hàng.");
  }

  if (order.status !== ORDER_STATUS.PREPARING) {
    throw new ApiError(400, "Đơn hàng không ở trạng thái đang chế biến.");
  }

  order.status = ORDER_STATUS.READY_FOR_DELIVERY;
  order.statusHistory.push({
    status: ORDER_STATUS.READY_FOR_DELIVERY,
    changedBy: req.user._id,
    note: "Bếp hoàn thành chế biến, chờ giao hàng"
  });

  await order.save();

  res.json({
    success: true,
    message: "Đơn hàng đã sẵn sàng giao.",
    data: { order }
  });
}

async function updateProfile(req, res) {
  const { fullName, phone, hometown, email, birthDate, gender } = req.body;

  const user = await User.findById(req.user._id).populate("employee");
  if (!user || !user.employee) {
    throw new ApiError(404, "Không tìm thấy thông tin hồ sơ nhân viên.");
  }

  const employee = await Employee.findById(user.employee._id);
  if (!employee) {
    throw new ApiError(404, "Không tìm thấy hồ sơ nhân viên.");
  }

  if (fullName) employee.fullName = fullName;
  if (phone !== undefined) employee.phone = phone;
  if (hometown !== undefined) employee.hometown = hometown;
  if (email !== undefined) employee.email = email;
  if (birthDate !== undefined) employee.birthDate = birthDate ? new Date(birthDate) : null;
  if (gender !== undefined) employee.gender = gender;

  await employee.save();

  res.json({
    success: true,
    message: "Cập nhật thông tin cá nhân thành công.",
    data: { employee }
  });
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Vui lòng nhập mật khẩu cũ và mật khẩu mới.");
  }

  const user = await User.findById(req.user._id).select("+passwordHash");
  if (!user || !(await user.comparePassword(oldPassword))) {
    throw new ApiError(401, "Mật khẩu cũ không chính xác.");
  }

  user.passwordHash = await User.hashPassword(newPassword);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();

  res.clearCookie(config.cookieName, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    path: "/"
  });

  res.json({
    success: true,
    message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại."
  });
}

async function getProfile(req, res) {
  const user = await User.findById(req.user._id).populate("employee");
  if (!user || !user.employee) {
    throw new ApiError(404, "Không tìm thấy thông tin hồ sơ nhân viên.");
  }
  res.json({ success: true, data: { employee: user.employee } });
}

module.exports = {
  getProducts,
  createOrder,
  getPendingOrders,
  getPreparingOrders,
  acceptOrder,
  cancelOrder,
  serveOrder,
  readyOrder,
  updateProfile,
  changePassword,
  getProfile
};
