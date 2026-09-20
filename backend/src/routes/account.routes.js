const express = require('express');
const controller = require('../controllers/account.controller');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.route('/')
  .get(asyncHandler(controller.listAccounts))
  .post(asyncHandler(controller.createAccount));

router.get('/:id', asyncHandler(controller.getAccount));
router.patch('/:id', asyncHandler(controller.updateAccount));
router.patch('/:id/status', asyncHandler(controller.setAccountStatus));
router.patch('/:id/password', asyncHandler(controller.resetAccountPassword));
router.delete('/:id', asyncHandler(controller.deleteAccount));

module.exports = router;
