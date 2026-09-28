const express = require("express");
const controller = require("../controllers/banhang.controller"); 
const asyncHandler = require("../utils/asyncHandler");
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.post("/", authenticate, authorize(ROLES.CUSTOMER), asyncHandler(controller.createOrder));

module.exports = router;
