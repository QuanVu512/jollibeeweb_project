const express = require('express');
const controller = require('../controllers/adminProduct.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/options', asyncHandler(controller.getOptions));

router.route('/')
  .get(asyncHandler(controller.listProducts))
  .post(asyncHandler(controller.createProduct));

router.route('/:id')
  .get(asyncHandler(controller.getProduct))
  .patch(asyncHandler(controller.updateProduct))
  .delete(asyncHandler(controller.deactivateProduct));

module.exports = router;
