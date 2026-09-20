const express = require("express");
const controller = require("../controllers/banhang.controller");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();


router.get("/", asyncHandler(controller.getProducts));

module.exports = router;