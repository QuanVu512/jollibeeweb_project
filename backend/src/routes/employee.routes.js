const express = require('express');
const controller = require('../controllers/employee.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.route('/')
  .get(asyncHandler(controller.listEmployees))
  .post(asyncHandler(controller.createEmployee));

router.route('/:id')
  .get(asyncHandler(controller.getEmployee))
  .patch(asyncHandler(controller.updateEmployee))
  .delete(asyncHandler(controller.deleteEmployee));

module.exports = router;
