const banhangService = require('../services/banhangService');

async function getProducts(_req, res) {
  const items = await banhangService.getProducts();
  res.json({ success: true, data: { items } });
}

async function createOrder(req, res) {
  const result = await banhangService.createOrder(req.body, req.user ? req.user._id : null);
  res.status(201).json({
    success: true,
    message: result.message,
    data: { order: result.order, inventory: result.inventory }
  });
}

async function getPendingOrders(_req, res) {
  const items = await banhangService.getPendingOrders();
  res.json({ success: true, data: { items } });
}

async function getPreparingOrders(_req, res) {
  const items = await banhangService.getPreparingOrders();
  res.json({ success: true, data: { items } });
}

async function acceptOrder(req, res) {
  const result = await banhangService.acceptOrder(req.params.id, req.user._id);
  res.json({
    success: true,
    message: result.message,
    data: { order: result.order, inventory: result.inventory }
  });
}

async function getOrders(req, res) {
  const items = await banhangService.getPosOrders(req.query);
  res.json({ success: true, data: { items } });
}

async function getOrderDetails(req, res) {
  const order = await banhangService.getOrderDetails(req.params.id);
  res.json({ success: true, data: { order } });
}

async function updateOrder(req, res) {
  const result = await banhangService.updateOrder(
    req.params.id,
    req.body,
    req.user ? req.user._id : null,
    req.user ? req.user.role : null
  );
  res.json({
    success: true,
    message: result.message,
    data: { order: result.order, inventory: result.inventory }
  });
}

async function printInvoice(req, res) {
  const order = await banhangService.printInvoice(req.params.id, req.user ? req.user._id : null);
  res.json({
    success: true,
    message: 'Đã xuất hóa đơn thành công.',
    data: { order }
  });
}

async function verifyAdmin(req, res) {
  const isValid = await banhangService.verifyAdminPassword(req.body.adminPassword);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Mật khẩu Quản trị viên không chính xác.' });
  }
  res.json({ success: true, message: 'Xác thực Quản trị viên thành công.' });
}

async function cancelOrder(req, res) {
  const order = await banhangService.cancelOrder(
    req.params.id,
    req.body,
    req.user ? req.user._id : null,
    req.user ? req.user.role : null
  );
  res.json({ success: true, message: 'Đã hủy đơn hàng thành công.', data: { order } });
}

async function serveOrder(req, res) {
  const result = await banhangService.serveOrder(req.params.id, req.user._id);
  res.json({
    success: true,
    message: result.message,
    data: { order: result.order, inventory: result.inventory }
  });
}

async function readyOrder(req, res) {
  const result = await banhangService.readyOrder(req.params.id, req.user._id);
  res.json({
    success: true,
    message: result.message,
    data: { order: result.order, inventory: result.inventory }
  });
}

module.exports = {
  getProducts,
  createOrder,
  getOrders,
  getOrderDetails,
  getPendingOrders,
  getPreparingOrders,
  acceptOrder,
  cancelOrder,
  updateOrder,
  printInvoice,
  verifyAdmin,
  serveOrder,
  readyOrder
};
