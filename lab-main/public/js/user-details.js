// تعريف المتغير userId في النطاق العام
let userId;

// تحميل بيانات المستخدم عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // جلب معرف المستخدم من عنوان URL
    const urlParams = new URLSearchParams(window.location.search);
    userId = urlParams.get('id');

    if (!userId) {
        alert('لم يتم تحديد المستخدم');
        window.location.href = '/admin';
        return;
    }

    // جلب بيانات المستخدم
    loadUserDetails();
});

// تبديل علامات التبويب
function switchTab(tabId) {
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إزالة النشط من جميع علامات التبويب
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إظهار المحتوى المحدد
    document.getElementById(tabId).classList.add('active');
    
    // تفعيل علامة التبويب المحددة
    document.querySelector(`.tab[onclick="switchTab('${tabId}')"]`).classList.add('active');
}

// جلب بيانات المستخدم
async function loadUserDetails() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/pages/login.html';
            return;
        }

        const userId = new URLSearchParams(window.location.search).get('id');
        if (!userId) {
            showError('معرف المستخدم غير موجود');
            return;
        }

        const response = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('فشل في جلب بيانات المستخدم');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }

        displayUserDetails(data.data);
    } catch (error) {
        console.error('خطأ في جلب بيانات المستخدم:', error);
        showError(error.message);
    }
}

// دالة إضافة موعد
function addAppointment() {
    // سيتم تنفيذ هذه الدالة لاحقاً
    alert('سيتم إضافة موعد جديد');
}

// دالة إضافة تحليل
function addTest() {
    // سيتم تنفيذ هذه الدالة لاحقاً
    alert('سيتم إضافة تحليل جديد');
}

// دالة إرسال رسالة
function sendMessage() {
    // سيتم تنفيذ هذه الدالة لاحقاً
    alert('سيتم إرسال رسالة');
}

// دالة تنشيط/إلغاء تنشيط المستخدم
async function toggleActivation() {
    try {
        const user = await getUserDetails();
        if (!user) {
            showError('لم يتم العثور على بيانات المستخدم');
            return;
        }

        const isActive = user.isActive;
        const token = localStorage.getItem('token');
        if (!token) {
            showError('الرجاء تسجيل الدخول مرة أخرى');
            return;
        }

        const response = await fetch(`/api/admin/users/${userId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: !isActive })
        });

        if (!response.ok) {
            throw new Error('فشل في تحديث حالة المستخدم');
        }

        const data = await response.json();
        if (data.success) {
            showSuccess(data.message);
            await loadUserDetails();
        } else {
            showError(data.message);
        }
    } catch (error) {
        showError(error.message);
    }
}

// دالة مساعدة لجلب تفاصيل المستخدم
async function getUserDetails() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return null;
        }

        const response = await fetch(`/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('فشل في جلب بيانات المستخدم');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }

        return data.data;
    } catch (error) {
        console.error('خطأ في جلب بيانات المستخدم:', error);
        showError(error.message);
        return null;
    }
}

// دالة لعرض رسائل الخطأ
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // إضافة تأثير الظهور
    setTimeout(() => errorDiv.classList.add('show'), 10);
    
    // إزالة الرسالة بعد 5 ثواني
    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // إضافة تأثير الظهور
    setTimeout(() => successDiv.classList.add('show'), 10);
    
    // إزالة الرسالة بعد 5 ثواني
    setTimeout(() => {
        successDiv.classList.remove('show');
        setTimeout(() => successDiv.remove(), 300);
    }, 5000);
}

// دالة لعرض تفاصيل المستخدم
function displayUserDetails(user) {
    // تحديث المعلومات الشخصية
    const elements = {
        username: document.getElementById('username'),
        fullName: document.getElementById('fullName'),
        phoneNumber: document.getElementById('phoneNumber'),
        age: document.getElementById('age'),
        bloodType: document.getElementById('bloodType'),
        address: document.getElementById('address'),
        medicalBloodType: document.getElementById('medicalBloodType'),
        medicalNotes: document.getElementById('medicalNotes'),
        totalAppointments: document.getElementById('totalAppointments'),
        totalTests: document.getElementById('totalTests'),
        pendingRequests: document.getElementById('pendingRequests'),
        activateBtn: document.getElementById('activateBtn'),
        userStatus: document.getElementById('userStatus')
    };

    // تحديث النصوص
    if (elements.username) elements.username.textContent = user.username || '-';
    if (elements.fullName) elements.fullName.textContent = user.profile?.fullName || '-';
    if (elements.phoneNumber) elements.phoneNumber.textContent = user.profile?.phoneNumber || '-';
    if (elements.age) elements.age.textContent = user.profile?.age || '-';
    if (elements.bloodType) elements.bloodType.textContent = user.profile?.bloodType || '-';
    if (elements.address) elements.address.textContent = user.profile?.address || '-';
    if (elements.medicalBloodType) elements.medicalBloodType.textContent = user.profile?.bloodType || '-';
    if (elements.medicalNotes) elements.medicalNotes.textContent = user.profile?.medicalNotes || '-';
    if (elements.totalAppointments) elements.totalAppointments.textContent = user.stats?.totalAppointments || 0;
    if (elements.totalTests) elements.totalTests.textContent = user.stats?.totalTests || 0;
    if (elements.pendingRequests) elements.pendingRequests.textContent = user.stats?.pendingRequests || 0;

    // تحديث حالة زر التنشيط
    if (elements.activateBtn) {
        if (user.isActive) {
            elements.activateBtn.innerHTML = '<i class="fas fa-user-slash"></i> إلغاء التنشيط';
            elements.activateBtn.className = 'btn btn-danger';
        } else {
            elements.activateBtn.innerHTML = '<i class="fas fa-user-check"></i> تنشيط الحساب';
            elements.activateBtn.className = 'btn btn-success';
        }
    }

    // تحديث حالة المستخدم
    if (elements.userStatus) {
        if (user.isActive) {
            elements.userStatus.className = 'badge bg-success';
            elements.userStatus.textContent = 'نشط';
        } else {
            elements.userStatus.className = 'badge bg-danger';
            elements.userStatus.textContent = 'غير نشط';
        }
    }
}