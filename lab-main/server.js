const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./src/config/db');
require('dotenv').config();
const fs = require('fs');
const authController = require('./src/controllers/authController');

// إنشاء تطبيق Express
const app = express();

// الاتصال بقاعدة البيانات
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// مجلد التحميلات
app.use('/uploads', express.static('uploads'));

// إنشاء مجلد التحميلات إذا لم يكن موجوداً
if (!fs.existsSync('uploads/tests')) {
    fs.mkdirSync('uploads/tests', { recursive: true });
}

// تكوين API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/patient', require('./src/routes/patientRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));

// إضافة مسارات المصادقةد

// المسارات الأساسية للصفحات
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

// مسارات الصفحات
const pages = [
    'about',
    'admin',
    'booking',
    'contact',
    'faq',
    'login',
    'news',
    'patient',
    'register',
    'services',
    'testimonials'
];

// إنشاء مسار لكل صفحة
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'pages', `${page}.html`));
    });

    // إضافة مسار للطلبات التي تتضمن .html
    app.get(`/${page}.html`, (req, res) => {
        res.redirect(`/${page}`);
    });
});

app.get('/pages/user-details.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'user-details.html'));
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'حدث خطأ في الخادم'
    });
});

// معالجة المسارات غير الموجودة
app.get('*', (req, res) => {
    res.status(404).send(`
        <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
            <h1>الصفحة غير موجودة</h1>
            <a href="/" style="text-decoration: none; color: blue;">العودة للصفحة الرئيسية</a>
        </div>
    `);
});

// تشغيل السيرفر
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});