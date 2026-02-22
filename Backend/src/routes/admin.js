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

// User Document Types Management
router.get('/users/:id/document-types', adminController.getUserDocumentTypes);
router.post('/users/:id/document-types', adminController.createUserDocumentType);
router.put('/users/:id/document-types/:typeId', adminController.updateUserDocumentType);
router.delete('/users/:id/document-types/:typeId', adminController.deleteUserDocumentType);

// Activity log
router.get('/activity', adminController.getActivityLog);

// Document management
router.get('/documents', adminController.getDocuments);
router.delete('/documents/:id', adminController.adminDeleteDocument);

// System configuration
router.get('/system-config', adminController.getSystemConfig);
router.put('/system-config', adminController.updateSystemConfig);

// Scan statistics
router.get('/scan-statistics', adminController.getScanStatistics);

module.exports = router;
