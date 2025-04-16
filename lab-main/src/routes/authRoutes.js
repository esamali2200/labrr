const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getMe, 
    createNewAdmin  // أضف هذا الاستيراد
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// المسارات الموجودة
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// المسار الجديد
router.post('/create-new-admin', createNewAdmin);

module.exports = router;