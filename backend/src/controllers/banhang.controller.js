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

async function cancelOrder(req, res) {
  const order = await banhangService.cancelOrder(req.params.id, req.body, req.user._id);
  res.json({ success: true, message: 'Đã hủy đơn hàng.', data: { order } });
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
  getPendingOrders,
  getPreparingOrders,
  acceptOrder,
  cancelOrder,
  serveOrder,
  readyOrder
};
