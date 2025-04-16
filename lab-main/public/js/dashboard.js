// public/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // التحقق من تسجيل الدخول
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/login';
        return;
    }

    // تحميل بيانات المستخدم
    loadUserProfile(user);
    
    // تفعيل التنقل بين الأقسام
    setupNavigation();
    
    // تفعيل زر تسجيل الخروج
    setupLogout();
});

// تحميل بيانات المستخدم
function loadUserProfile(user) {
    // عرض اسم المستخدم في القائمة الجانبية
    document.getElementById('userName').textContent = user.profile.fullName;
    
    // عرض البيانات في قسم الملف الشخصي
    document.getElementById('fullName').textContent = user.profile.fullName;
    document.getElementById('phone').textContent = user.profile.phoneNumber;
    document.getElementById('age').textContent = user.profile.age;
    document.getElementById('bloodType').textContent = user.profile.bloodType;
    
    // تعبئة نموذج الإعدادات
    document.getElementById('editFullName').value = user.profile.fullName;
    document.getElementById('editPhone').value = user.profile.phoneNumber;
    document.getElementById('editAge').value = user.profile.age;
    document.getElementById('editBloodType').value = user.profile.bloodType;
}

// إعداد التنقل بين الأقسام
function setupNavigation() {
    const menuLinks = document.querySelectorAll('.dashboard-menu a');
    const sections = document.querySelectorAll('.dashboard-section');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // إزالة الكلاس active من جميع الروابط
            menuLinks.forEach(l => l.parentElement.classList.remove('active'));
            // إضافة الكلاس active للرابط المختار
            e.target.parentElement.classList.add('active');
            
            // إخفاء جميع الأقسام
            sections.forEach(section => section.classList.add('hidden'));
            
            // إظهار القسم المطلوب
            const targetId = e.target.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
}

// إعداد زر تسجيل الخروج
function setupLogout() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // مسح بيانات المستخدم من localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // التوجيه إلى صفحة تسجيل الدخول
        window.location.href = '/login';
    });
}

// معالجة تحديث البيانات الشخصية
document.getElementById('settingsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const updatedProfile = {
        fullName: document.getElementById('editFullName').value,
        phoneNumber: document.getElementById('editPhone').value,
        age: document.getElementById('editAge').value,
        bloodType: document.getElementById('editBloodType').value
    };

    // تحديث البيانات في localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    user.profile = { ...user.profile, ...updatedProfile };
    localStorage.setItem('user', JSON.stringify(user));

    // تحديث العرض
    loadUserProfile(user);
    alert('تم حفظ التغييرات بنجاح');
});