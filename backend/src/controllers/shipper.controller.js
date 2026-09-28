const shipperService = require('../services/shipperService');

async function getNewOrders(_req, res) {
  const items = await shipperService.getNewOrders();
  res.json({ success: true, data: { items } });
}

async function getShippingOrders(req, res) {
  const items = await shipperService.getShippingOrders(req.user._id);
  res.json({ success: true, data: { items } });
}

async function getHistoryOrders(req, res) {
  const items = await shipperService.getHistoryOrders(req.user._id);
  res.json({ success: true, data: { items } });
}

async function getOrderDetail(req, res) {
  const order = await shipperService.getOrderDetail(req.params.id);
  res.json({ success: true, data: { order } });
}

async function acceptOrder(req, res) {
  const order = await shipperService.acceptOrder(req.params.id, req.user._id);
  res.json({ success: true, message: 'Đã nhận đơn giao hàng.', data: { order } });
}

async function completeOrder(req, res) {
  const order = await shipperService.completeOrder(req.params.id, req.user._id);
  res.json({ success: true, message: 'Đơn hàng đã giao thành công.', data: { order } });
}

async function failOrder(req, res) {
  const order = await shipperService.failOrder(req.params.id, req.user._id, req.body);
  res.json({ success: true, message: 'Đã cập nhật đơn giao thất bại.', data: { order } });
}

async function cancelOrder(req, res) {
  const order = await shipperService.cancelOrder(req.params.id, req.user._id);
  res.json({ success: true, message: 'Đã hủy nhận đơn.', data: { order } });
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
