// controllers/adminController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Test = require('../models/Test');

// إدارة المستخدمين
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: 'patient' }) // جلب المرضى فقط
            .select('-password')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('خطأ في جلب المستخدمين:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب المستخدمين'
        });
    }
};

// معالجة طلبات تحديث الملف الشخصي
exports.handleProfileUpdate = async (req, res) => {
    try {
        const { userId, status, adminResponse } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        if (status === 'approved') {
            user.profile = { ...user.profileUpdateRequest.updatedFields };
        }

        user.profileUpdateRequest.status = status;
        user.profileUpdateRequest.adminResponse = adminResponse;
        await user.save();

        res.json({
            success: true,
            message: 'تم معالجة طلب التحديث بنجاح'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// إدارة المواعيد
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'username profile')
            .populate('processedBy', 'username');
        
        res.json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// تحديث حالة الموعد
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { appointmentId, status, notes } = req.body;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'الموعد غير موجود'
            });
        }

        appointment.status = status;
        appointment.notes = notes;
        appointment.processedBy = req.user._id;
        appointment.processedAt = new Date();
        
        await appointment.save();

        res.json({
            success: true,
            message: 'تم تحديث حالة الموعد بنجاح',
            data: appointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// إدارة التحاليل
exports.addTestResult = async (req, res) => {
    try {
        const { appointmentId, testType, results, doctorNotes } = req.body;
        
        // التحقق من وجود الموعد
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'الموعد غير موجود'
            });
        }

        // إنشاء تحليل جديد
        const test = await Test.create({
            patient: appointment.patient,
            appointment: appointmentId,
            testType,
            testDate: new Date(),
            results,
            doctorNotes,
            processedBy: req.user._id,
            status: 'completed'
        });

        // تحديث حالة الموعد
        appointment.status = 'completed';
        await appointment.save();

        res.status(201).json({
            success: true,
            message: 'تم إضافة نتائج التحليل بنجاح',
            data: test
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// إحصائيات عامة
exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            totalPatients: await User.countDocuments({ role: 'patient' }),
            pendingAppointments: await Appointment.countDocuments({ status: 'pending' }),
            todayAppointments: await Appointment.countDocuments({
                appointmentDate: {
                    $gte: new Date().setHours(0, 0, 0),
                    $lt: new Date().setHours(23, 59, 59)
                }
            }),
            completedTests: await Test.countDocuments({ status: 'completed' })
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// جلب مستخدم معين
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('خطأ في جلب بيانات المستخدم:', error);
        res.status(500).json({
            success: false,
            message: 'خطأ في جلب بيانات المستخدم'
        });
    }
};

exports.toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `تم ${user.isActive ? 'تنشيط' : 'تعطيل'} الحساب بنجاح`,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};