const express = require("express");
const controller = require("../controllers/banhang.controller");
const asyncHandler = require("../utils/asyncHandler");
const { authorize } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

const router = express.Router();

const cashierOrAdmin = authorize(ROLES.CASHIER, ROLES.ADMIN);
const anyStaff = authorize(ROLES.CASHIER, ROLES.KITCHEN, ROLES.ADMIN);

// Thu ngân (Cashier) & Bếp (Kitchen)
router.get("/products", cashierOrAdmin, asyncHandler(controller.getProducts));
router.post("/orders", cashierOrAdmin, asyncHandler(controller.createOrder));
router.get("/orders", cashierOrAdmin, asyncHandler(controller.getOrders));
router.get("/orders/pending", cashierOrAdmin, asyncHandler(controller.getPendingOrders));
router.get("/orders/preparing", anyStaff, asyncHandler(controller.getPreparingOrders));
router.get("/orders/:id", cashierOrAdmin, asyncHandler(controller.getOrderDetails));
router.put("/orders/:id", cashierOrAdmin, asyncHandler(controller.updateOrder));
router.patch("/orders/:id/accept", cashierOrAdmin, asyncHandler(controller.acceptOrder));
router.patch("/orders/:id/cancel", cashierOrAdmin, asyncHandler(controller.cancelOrder));
router.patch("/orders/:id/serve", anyStaff, asyncHandler(controller.serveOrder));
router.patch("/orders/:id/ready", anyStaff, asyncHandler(controller.readyOrder));
router.post("/orders/:id/invoice", cashierOrAdmin, asyncHandler(controller.printInvoice));
router.post("/verify-admin", cashierOrAdmin, asyncHandler(controller.verifyAdmin));

// Tài khoản chung - Đã gỡ bỏ tính năng sửa hồ sơ/đổi mật khẩu của phân hệ bán hàng

module.exports = router;
