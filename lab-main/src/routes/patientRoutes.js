// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getProfile,
    requestProfileUpdate,
    createAppointment,
    getAppointments,
    getTests,
    shareTestResults
} = require('../controllers/patientController');

// حماية جميع مسارات المريض
router.use(protect);
router.use(authorize('patient'));

// مسارات الملف الشخصي
router.get('/profile', getProfile);
router.post('/profile/update-request', requestProfileUpdate);

// مسارات المواعيد
router.post('/appointments', createAppointment);
router.get('/appointments', getAppointments);

// مسارات التحاليل
router.get('/tests', getTests);
router.post('/tests/share', shareTestResults);

module.exports = router;