const express = require("express");
const controller = require("../controllers/banhang.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authorize } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

const router = express.Router();

const cashierOrAdmin = authorize(ROLES.CASHIER, ROLES.ADMIN);
const anyStaff = authorize(ROLES.CASHIER, ROLES.KITCHEN, ROLES.ADMIN);

// Thu ngân (Cashier)
router.get("/products", cashierOrAdmin, asyncHandler(controller.getProducts));
router.post("/orders", cashierOrAdmin, asyncHandler(controller.createOrder));
router.get("/orders/pending", cashierOrAdmin, asyncHandler(controller.getPendingOrders));
router.patch("/orders/:id/accept", cashierOrAdmin, asyncHandler(controller.acceptOrder));
router.patch("/orders/:id/cancel", cashierOrAdmin, asyncHandler(controller.cancelOrder));

// Bếp (Kitchen) / Thu ngân cũng có thể xem
router.get("/orders/preparing", anyStaff, asyncHandler(controller.getPreparingOrders));
router.patch("/orders/:id/serve", cashierOrAdmin, asyncHandler(controller.serveOrder));
router.patch("/orders/:id/ready", cashierOrAdmin, asyncHandler(controller.readyOrder));

// Tài khoản chung
router.get("/profile", anyStaff, asyncHandler(controller.getProfile));
router.patch("/profile", anyStaff, asyncHandler(controller.updateProfile));
router.patch("/password", anyStaff, asyncHandler(controller.changePassword));

module.exports = router;
