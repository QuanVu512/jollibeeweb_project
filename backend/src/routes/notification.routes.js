const express = require('express');
const controller = require('../controllers/notification.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.route('/')
  .get(asyncHandler(controller.listNotifications))
  .post(asyncHandler(controller.createNotification));

module.exports = router;
