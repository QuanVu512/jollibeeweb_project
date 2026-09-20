// API thông báo được giữ lại cho tương lai nhưng hiện chưa được giao diện quản trị sử dụng.
const express = require('express');
const controller = require('../controllers/notification.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.route('/')
  .get(asyncHandler(controller.listNotifications))
  .post(asyncHandler(controller.createNotification));

module.exports = router;
