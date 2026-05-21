const express = require('express');
const router = express.Router();
const { authenticate, isSuperAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All admin routes require authentication
router.use(authenticate);

// --- Routes accessible during impersonation (before isSuperAdmin check) ---
// Stop impersonate must work when session is a regular user (impersonated)
router.post('/stop-impersonate', adminController.stopImpersonate);

// --- All routes below require superadmin role ---
router.use(isSuperAdmin);

// Impersonate user
router.post('/impersonate/:userId', adminController.impersonateUser);

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);

// User sub-resource routes (must be before generic /users/:id)
router.get('/users/:id/api-key', adminController.getUserApiKey);
router.put('/users/:id/api-key', adminController.updateUserApiKey);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.put('/users/:id/features', adminController.updateUserFeatures);
router.get('/users/:id/document-types', adminController.getUserDocumentTypes);
router.post('/users/:id/document-types', adminController.createUserDocumentType);
router.put('/users/:id/document-types/:typeId', adminController.updateUserDocumentType);
router.delete('/users/:id/document-types/:typeId', adminController.deleteUserDocumentType);

// Generic user CRUD (after sub-routes)
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

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
