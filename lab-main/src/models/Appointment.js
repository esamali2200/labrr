// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    // معرف المريض (رابط مع جدول المستخدمين)
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // تفاصيل الموعد
    appointmentDate: {
        type: Date,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },

    // نوع التحليل المطلوب
    testType: {
        type: String,
        required: true
    },

    // حالة الموعد
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },

    // ملاحظات
    notes: {
        type: String,
        default: ''
    },

    // من قام بتأكيد أو إلغاء الموعد (الأدمن)
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    // تاريخ المعالجة
    processedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// التحقق من أن الموعد في وقت العمل
appointmentSchema.pre('save', function(next) {
    const time = parseInt(this.appointmentTime.split(':')[0]);
    if (time < 9 || time > 17) {
        next(new Error('مواعيد العمل من 9 صباحاً إلى 5 مساءً'));
    }
    next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;