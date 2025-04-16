// middleware/upload.js
const multer = require('multer');
const path = require('path');

// تكوين التخزين
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/tests');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `test-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// فلترة الملفات
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('يرجى رفع ملف PDF فقط'), false);
    }
};

// إعداد رفع الملفات
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 ميجابايت كحد أقصى
    }
});

module.exports = upload;