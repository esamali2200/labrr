// controllers/patientController.js
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Test = require('../models/Test');

// عرض الملف الشخصي للمريض
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// طلب تحديث الملف الشخصي
exports.requestProfileUpdate = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        user.profileUpdateRequest = {
            status: 'pending',
            updatedFields: req.body,
            requestDate: new Date()
        };

        await user.save();

        res.json({
            success: true,
            message: 'تم إرسال طلب التحديث بنجاح'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// حجز موعد جديد
exports.createAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.create({
            patient: req.user._id,
            ...req.body
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// عرض مواعيد المريض
exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patient: req.user._id });
        res.json({
            success: true,
            data: appointments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// عرض تحاليل المريض
exports.getTests = async (req, res) => {
    try {
        const tests = await Test.find({ patient: req.user._id });
        res.json({
            success: true,
            data: tests
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// طلب مشاركة نتائج التحليل
exports.shareTestResults = async (req, res) => {
    try {
        const { testId, email } = req.body;
        const test = await Test.findOne({
            _id: testId,
            patient: req.user._id
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'التحليل غير موجود'
            });
        }

        const accessToken = test.addShare(email);
        await test.save();

        res.json({
            success: true,
            message: 'تم مشاركة نتائج التحليل بنجاح',
            accessToken
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};