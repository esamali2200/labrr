const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'اسم المستخدم مطلوب'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'كلمة المرور مطلوبة']
    },
    role: {
        type: String,
        enum: ['admin', 'patient'],
        default: 'patient'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    profile: {
        fullName: {
            type: String,
            required: [true, 'الاسم الكامل مطلوب']
        },
        age: {
            type: Number,
            required: [true, 'العمر مطلوب']
        },
        bloodType: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
            required: [true, 'فصيلة الدم مطلوبة']
        },
        phoneNumber: {
            type: String,
            required: [true, 'رقم الهاتف مطلوب']
        },
        address: {
            type: String,
            required: [true, 'العنوان مطلوب']
        },
        medicalNotes: {
            type: String,
            default: ''
        }
    }
}, {
    timestamps: true
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// دالة للتحقق من كلمة المرور
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;