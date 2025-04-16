const jwt = require('jsonwebtoken');
const User = require('../models/User');

// إنشاء توكن
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
    try {
        console.log('Request Body:', req.body); // تحقق من البيانات المستلمة

        const { username, password, role, profile } = req.body;

        // التحقق من وجود الأدمن
        if (role === 'admin') {
            const adminExists = await User.findOne({ role: 'admin' });
            if (adminExists) {
                return res.status(400).json({
                    success: false,
                    message: 'الأدمن موجود بالفعل'
                });
            }
        }

        const user = await User.create({ username, password, role, profile });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: user,
            token
        });
    } catch (error) {
        console.error('Error:', error.message); // تسجيل الخطأ
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// تسجيل الدخول
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'بيانات الدخول غير صحيحة'
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'بيانات الدخول غير صحيحة'
            });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في الخادم'
        });
    }
};

// الحصول على بيانات المستخدم الحالي
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.createNewAdmin = async (req, res) => {
    try {
        // التحقق من عدم وجود أدمن
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({
                success: false,
                message: 'يوجد أدمن بالفعل'
            });
        }

        // إنشاء أدمن جديد
        const adminUser = await User.create({
            username: 'admin2024',
            password: 'Admin@2024',
            role: 'admin',
            profile: {
                fullName: 'System Admin',
                phoneNumber: '0000000000',
                address: 'Admin Address',
                // أضف كل الحقول المطلوبة في نموذج المستخدم
                age: 30,
                bloodType: 'O+',
                medicalNotes: ''
            }
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الأدمن بنجاح',
            admin: {
                username: adminUser.username,
                role: adminUser.role
            }
        });
    } catch (error) {
        // إضافة تفاصيل الخطأ في الرد
        console.error('Error creating admin:', error);
        res.status(500).json({
            success: false,
            message: 'فشل في إنشاء الأدمن',
            error: error.message // إضافة رسالة الخطأ التفصيلية
        });
    }
};