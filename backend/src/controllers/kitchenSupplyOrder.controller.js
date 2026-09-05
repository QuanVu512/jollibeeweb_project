const kitchenSupplyOrderService = require('../services/kitchenSupplyOrderService');

async function listPurchaseMaterials(_req, res) {
  const purchaseMaterials = await kitchenSupplyOrderService.listPurchaseMaterials();
  res.json({ success: true, data: purchaseMaterials });
}

async function listOrders(_req, res) {
  const orders = await kitchenSupplyOrderService.listOrders();
  res.json({ success: true, data: orders });
}

async function createOrder(req, res) {
  const order = await kitchenSupplyOrderService.createOrder(req.body, req.user?._id);
  res.status(201).json({ success: true, data: order });
}

async function confirmOrder(req, res) {
  const order = await kitchenSupplyOrderService.confirmOrder(req.params.id, req.body, req.user?._id);
  res.json({ success: true, data: order });
}

async function cancelOrder(req, res) {
  const order = await kitchenSupplyOrderService.cancelOrder(req.params.id, req.body, req.user?._id);
  res.json({ success: true, data: order });
}

module.exports = {
  listPurchaseMaterials,
  listOrders,
  createOrder,
  confirmOrder,
  cancelOrder
};
