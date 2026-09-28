const Customer = require('../models/Customer');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const { ORDER_STATUS } = require('../constants/orderStatus');

function validateDeliveryAddress(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new ApiError(400, 'Vui lòng nhập địa chỉ giao hàng.');
  }
  const address = value.trim();
  if (address.length > 300) throw new ApiError(400, 'Địa chỉ giao hàng không được vượt quá 300 ký tự.');
  return address;
}

async function customerFor(user) {
  const owners = [{ account: user._id }];
  if (user.customer) owners.push({ _id: user.customer });
  const customer = await Customer.findOne({ $or: owners, isActive: true }).select('_id');
  if (!customer) throw new ApiError(404, 'Không tìm thấy hồ sơ khách hàng.');
  return customer;
}

function ownershipFilter(customerId, userId) {
  return {
    $or: [
      { customer: customerId },
      { customer: null, createdBy: userId, source: 'web' }
    ]
  };
}

async function listMyOrders(req, res) {
  const customer = await customerFor(req.user);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
  const items = await Order.find(ownershipFilter(customer._id, req.user._id))
    .sort({ orderedAt: -1 })
    .limit(limit)
    .lean();
  res.json({ success: true, data: { items } });
}

async function updateMyOrderAddress(req, res) {
  const customer = await customerFor(req.user);
  const deliveryAddress = validateDeliveryAddress(req.body.deliveryAddress);
  const order = await Order.findOneAndUpdate(
    {
      _id: req.params.id,
      status: ORDER_STATUS.PENDING,
      ...ownershipFilter(customer._id, req.user._id)
    },
    {
      $set: { deliveryAddress },
      $push: {
        statusHistory: {
          status: ORDER_STATUS.PENDING,
          changedBy: req.user._id,
          note: 'Khách hàng cập nhật địa chỉ giao hàng'
        }
      }
    },
    { new: true, runValidators: true }
  );
  if (!order) throw new ApiError(409, 'Chỉ có thể đổi địa chỉ khi đơn hàng đang chờ xác nhận.');
  res.json({ success: true, message: 'Đã cập nhật địa chỉ giao hàng.', data: { order } });
}

async function cancelMyOrder(req, res) {
  const customer = await customerFor(req.user);
  const reason = typeof req.body.reason === 'string' && req.body.reason.trim()
    ? req.body.reason.trim().slice(0, 300)
    : 'Khách hàng hủy đơn trước khi chế biến';
  const cancelPendingOrder = require('../services/cancelPendingOrder');
  const order = await cancelPendingOrder({ _id: req.params.id, ...ownershipFilter(customer._id, req.user._id) }, req.user._id, reason);
  res.json({ success: true, message: 'Đã hủy đơn hàng.', data: { order } });
}

module.exports = { listMyOrders, updateMyOrderAddress, cancelMyOrder, validateDeliveryAddress };
