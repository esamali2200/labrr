// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    handleProfileUpdate,
    getAllAppointments,
    updateAppointmentStatus,
    addTestResult,
    getDashboardStats,
    getUserById,
    toggleUserStatus
} = require('../controllers/adminController');

// حماية جميع مسارات الأدمن
router.use(protect);
router.use(authorize('admin'));

// إدارة المستخدمين
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users/profile-update', handleProfileUpdate);
router.patch('/users/:id/status', toggleUserStatus);

// إدارة المواعيد
router.get('/appointments', getAllAppointments);
router.post('/appointments/status', updateAppointmentStatus);

// إدارة التحاليل
router.post('/tests', addTestResult);

// لوحة التحكم
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;