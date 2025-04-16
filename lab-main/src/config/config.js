// src/config/config.js
module.exports = {
    // إعدادات قاعدة البيانات
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lab-db',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        }
    },
    
    // إعدادات JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },
    
    // إعدادات الخادم
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost'
    },
    
    // إعدادات تحميل الملفات
    upload: {
        // مسار حفظ ملفات التحاليل
        testsPath: 'uploads/tests',
        // أنواع الملفات المسموح بها
        allowedTypes: ['application/pdf'],
        // الحد الأقصى لحجم الملف (5 ميجابايت)
        maxSize: 5 * 1024 * 1024
    },

    // إعدادات المواعيد
    appointments: {
        // ساعات العمل
        workingHours: {
            start: '09:00',
            end: '17:00'
        },
        // المدة الزمنية للموعد (بالدقائق)
        duration: 30
    }
};