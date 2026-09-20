const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const shipperController = require("../controllers/shipper.controller");

const router = express.Router();

router.get("/orders/new", asyncHandler(shipperController.getNewOrders));

router.get(
  "/orders/shipping",
  asyncHandler(shipperController.getShippingOrders),
);

router.get("/orders/history", asyncHandler(shipperController.getHistoryOrders));

router.get("/orders/:id", asyncHandler(shipperController.getOrderDetail));

router.patch("/orders/:id/accept", asyncHandler(shipperController.acceptOrder));

router.patch(
  "/orders/:id/complete",
  asyncHandler(shipperController.completeOrder),
);

router.patch("/orders/:id/fail", asyncHandler(shipperController.failOrder));

router.patch("/orders/:id/cancel", asyncHandler(shipperController.cancelOrder));

module.exports = router;
