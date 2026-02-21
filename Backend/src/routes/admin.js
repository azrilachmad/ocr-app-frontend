const express = require('express');
const router = express.Router();
const { authenticate, isSuperAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication + superadmin role
router.use(authenticate, isSuperAdmin);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.delete('/users/:id', adminController.deleteUser);

// Feature toggles
router.put('/users/:id/features', adminController.updateUserFeatures);

// Activity log
router.get('/activity', adminController.getActivityLog);

module.exports = router;
