const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed'
});

module.exports = { ORDER_STATUS };
