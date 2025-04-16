// public/js/profile.js

// تحميل بيانات المستخدم الحالية
async function loadUserProfile() {
    try {
        // الحصول على بيانات المستخدم من localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = '/login';
            return;
        }

        // عرض بيانات الملف الشخصي
        document.getElementById('userName').textContent = user.profile.fullName;
        document.getElementById('fullName').textContent = user.profile.fullName;
        document.getElementById('phone').textContent = user.profile.phoneNumber;
        document.getElementById('age').textContent = user.profile.age;
        document.getElementById('bloodType').textContent = user.profile.bloodType;
        document.getElementById('address').textContent = user.profile.address || 'غير محدد';

        // تعبئة نموذج التحديث
        document.getElementById('editFullName').value = user.profile.fullName;
        document.getElementById('editPhone').value = user.profile.phoneNumber;
        document.getElementById('editAge').value = user.profile.age;
        document.getElementById('editBloodType').value = user.profile.bloodType;
        document.getElementById('editAddress').value = user.profile.address || '';
        document.getElementById('editMedicalNotes').value = user.profile.medicalNotes || '';

        // التحقق من وجود طلب تحديث معلق
        checkUpdateRequest();
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('حدث خطأ في تحميل البيانات');
    }
}

// إرسال طلب تحديث البيانات
async function submitUpdateRequest(formData) {
    try {
        const response = await fetch('/api/profile/update-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showUpdateRequestStatus('pending');
            alert('تم إرسال طلب التحديث بنجاح');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert(error.message || 'حدث خطأ في إرسال الطلب');
    }
}

// التحقق من حالة طلب التحديث
async function checkUpdateRequest() {
    try {
        const response = await fetch('/api/profile/update-status', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok && data.updateRequest) {
            showUpdateRequestStatus(data.updateRequest.status, data.updateRequest.adminResponse);
        }
    } catch (error) {
        console.error('Error checking update status:', error);
    }
}

// إلغاء طلب التحديث
async function cancelUpdateRequest() {
    if (!confirm('هل أنت متأكد من إلغاء طلب التحديث؟')) return;

    try {
        const response = await fetch('/api/profile/update-request/cancel', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            hideUpdateRequestStatus();
            alert('تم إلغاء طلب التحديث');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert(error.message || 'حدث خطأ في إلغاء الطلب');
    }
}

// عرض حالة طلب التحديث
function showUpdateRequestStatus(status, message = '') {
    const statusCard = document.getElementById('updateRequestStatus');
    statusCard.classList.remove('hidden');
    
    // إزالة جميع classes السابقة
    statusCard.querySelector('.status-card').className = 'status-card ' + status;

    // تحديث النص والأيقونة حسب الحالة
    let statusText = '';
    let icon = '';
    
    switch (status) {
        case 'pending':
            statusText = 'طلب تحديث معلق';
            icon = 'clock';
            break;
        case 'approved':
            statusText = 'تم قبول طلب التحديث';
            icon = 'check';
            break;
        case 'rejected':
            statusText = 'تم رفض طلب التحديث';
            icon = 'times';
            break;
    }

    statusCard.querySelector('.status-header').innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${statusText}</span>
    `;

    if (message) {
        statusCard.querySelector('.status-content p').textContent = message;
    }
}

// إخفاء حالة طلب التحديث
function hideUpdateRequestStatus() {
    document.getElementById('updateRequestStatus').classList.add('hidden');
}

// معالجة تقديم نموذج التحديث
document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        fullName: document.getElementById('editFullName').value,
        phoneNumber: document.getElementById('editPhone').value,
        age: parseInt(document.getElementById('editAge').value),
        bloodType: document.getElementById('editBloodType').value,
        address: document.getElementById('editAddress').value,
        medicalNotes: document.getElementById('editMedicalNotes').value
    };

    await submitUpdateRequest(formData);
});

// تحميل البيانات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadUserProfile);