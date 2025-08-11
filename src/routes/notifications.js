const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Customer routes
router.get('/my-notifications', notificationController.getMyNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.get('/preferences', notificationController.getNotificationPreferences);
router.put('/preferences', notificationController.updateNotificationPreferences);

// Admin/Staff routes for automated notifications
router.post('/run-automated-jobs', authorize('admin'), notificationController.runAutomatedJobs);

module.exports = router;