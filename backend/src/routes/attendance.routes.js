const express = require('express');
const controller = require('../controllers/attendance.controller');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

router.route('/shift-templates').get(asyncHandler(controller.listTemplates)).post(asyncHandler(controller.createTemplate));
router.patch('/shift-templates/:id', asyncHandler(controller.updateTemplate));
router.route('/employee-shifts').get(asyncHandler(controller.listAssignments)).post(asyncHandler(controller.createAssignment));
router.patch('/employee-shifts/:id', asyncHandler(controller.updateAssignment));
router.post('/employee-shifts/:id/cancel', asyncHandler(controller.cancelAssignment));
router.get('/attendance', asyncHandler(controller.list));
router.post('/attendance/scan', asyncHandler(controller.scan));
router.post('/attendance/exceptions', asyncHandler(controller.approveException));
router.get('/attendance/receipts/:requestId', asyncHandler(controller.downloadBill));
router.get('/attendance/:id/history', asyncHandler(controller.history));
router.route('/attendance/:id').get(asyncHandler(controller.detail)).patch(asyncHandler(controller.correct));
router.post('/attendance/:id/cancel', asyncHandler(controller.cancel));

module.exports = router;
