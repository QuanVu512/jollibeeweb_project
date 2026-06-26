const express = require("express");

const authRoutes = require("./auth.routes");
const employeeRoutes = require("./employee.routes");
const accountRoutes = require("./account.routes");
const reportRoutes = require("./report.routes");
const adminRoutes = require("./admin.routes");
const shipperRoutes = require("./shipper.routes");
const kitchenRoutes = require("./kitchen.routes");
const banhangRoutes = require("./banhang.routes");
const notificationRoutes = require("./notification.routes");

const { authenticate, authorize } = require("../middleware/auth");
const { ROLES } = require("../constants/roles");

const router = express.Router();

router.use("/auth", authRoutes);

const adminOnly = [authenticate, authorize(ROLES.ADMIN)];
const shipperOnly = [authenticate, authorize(ROLES.SHIPPER, ROLES.ADMIN)];
const banhangStaff = [authenticate, authorize(ROLES.CASHIER, ROLES.KITCHEN, ROLES.ADMIN)];

router.use("/admin", ...adminOnly, adminRoutes);

router.use("/employees", ...adminOnly, employeeRoutes);
router.use("/accounts", ...adminOnly, accountRoutes);
router.use("/reports", ...adminOnly, reportRoutes);
router.use("/notifications", ...adminOnly, notificationRoutes);

router.use("/shipper", ...shipperOnly, shipperRoutes);
router.use("/kitchen", kitchenRoutes);
router.use("/banhang", ...banhangStaff, banhangRoutes);

module.exports = router;
