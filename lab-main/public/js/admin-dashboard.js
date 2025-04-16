// admin-dashboard.js
// تحديث لوحة معلومات الأدمن

/**
 * تحميل بيانات لوحة التحكم
 */
async function loadDashboardData() {
    try {
        showLoadingIndicator();
        
        // جلب الإحصائيات
        const stats = await fetchDashboardStats();
        updateDashboardCounters(stats);
        
        // جلب آخر الأنشطة
        const activities = await fetchLatestActivities(10);
        updateActivityFeed(activities);
        
        // جلب مواعيد اليوم
        const appointments = await fetchTodayAppointments();
        updateTodayAppointments(appointments);
        
        // جلب طلبات التحديث المعلقة
        const requests = await fetchPendingUpdateRequests(5);
        updatePendingRequests(requests);
        
        hideLoadingIndicator();
        
        // تحديث المؤشرات البصرية للإشعارات
        updateNotificationBadges(stats);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorMessage('فشل تحميل بيانات لوحة التحكم، يرجى تحديث الصفحة');
        hideLoadingIndicator();
    }
}

/**
 * جلب إحصائيات لوحة التحكم
 */
async function fetchDashboardStats() {
    const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || 'حدث خطأ أثناء جلب الإحصائيات');
    }
    
    return result.data;
}

/**
 * جلب آخر الأنشطة
 * @param {number} limit - عدد الأنشطة المطلوبة
 */
async function fetchLatestActivities(limit = 10) {
    const response = await fetch(`/api/admin/latest-activities?limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || 'حدث خطأ أثناء جلب الأنشطة');
    }
    
    return result.data;
}

/**
 * جلب مواعيد اليوم
 */
async function fetchTodayAppointments() {
    const response = await fetch('/api/admin/today-appointments', {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || 'حدث خطأ أثناء جلب مواعيد اليوم');
    }
    
    return result.data;
}

/**
 * جلب طلبات التحديث المعلقة
 * @param {number} limit - عدد الطلبات المطلوبة
 */
async function fetchPendingUpdateRequests(limit = 5) {
    const response = await fetch(`/api/admin/profile-update-requests?status=pending&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${getAuthToken()}`
        }
    });
    
    if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || 'حدث خطأ أثناء جلب طلبات التحديث');
    }
    
    return result.data;
}

/**
 * تحديث عدادات لوحة التحكم
 * @param {Object} stats - إحصائيات النظام
 */
function updateDashboardCounters(stats) {
    // تحديث العدادات الرئيسية
    document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
    document.getElementById('todayAppointments').textContent = stats.todayAppointments || 0;
    document.getElementById('pendingTests').textContent = stats.pendingTests || 0;
    document.getElementById('updateRequests').textContent = stats.updateRequests || 0;
    
    // تحديث النص الإضافي للعدادات
    const usersCounter = document.querySelector('.stat-card:nth-child(1) .text-muted');
    if (usersCounter) {
        usersCounter.textContent = `${stats.newUsersThisMonth || 0} مسجلين جدد هذا الشهر`;
    }
    
    const appointmentsCounter = document.querySelector('.stat-card:nth-child(2) .text-muted');
    if (appointmentsCounter) {
        const pendingCount = stats.todayAppointments - (stats.completedAppointmentsToday || 0);
        appointmentsCounter.textContent = `${pendingCount > 0 ? pendingCount : 0} مواعيد معلقة`;
    }
    
    const testsCounter = document.querySelector('.stat-card:nth-child(3) .text-muted');
    if (testsCounter) {
        testsCounter.textContent = `${stats.completedTestsThisMonth || 0} مكتملة هذا الشهر`;
    }
}

/**
 * تحديث قائمة آخر الأنشطة
 * @param {Array} activities - قائمة الأنشطة
 */
function updateActivityFeed(activities) {
    const activityList = document.getElementById('latestUserActivities');
    if (!activityList) return;
    
    if (!activities || activities.length === 0) {
        activityList.innerHTML = '<li class="list-group-item">لا توجد أنشطة حديثة</li>';
        return;
    }
    
    activityList.innerHTML = activities.map(activity => {
        const timeAgo = formatTimeAgo(new Date(activity.timestamp));
        
        return `
            <li class="list-group-item">
                <small class="text-muted">${timeAgo}</small>
                <p class="mb-0">
                    ${getActivityHTML(activity)}
                </p>
            </li>
        `;
    }).join('');
}

/**
 * تحديث قائمة مواعيد اليوم
 * @param {Array} appointments - قائمة المواعيد
 */
function updateTodayAppointments(appointments) {
    const appointmentsList = document.getElementById('todayAppointmentsTable');
    if (!appointmentsList) return;
    
    if (!appointments || appointments.length === 0) {
        appointmentsList.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">لا توجد مواعيد اليوم</td>
            </tr>
        `;
        return;
    }
    
    appointmentsList.innerHTML = appointments.map(appointment => {
        return `
            <tr>
                <td>${appointment.patient?.profile?.fullName || 'مريض غير معروف'}</td>
                <td>${appointment.appointmentTime}</td>
                <td>${getTestTypeName(appointment.testType)}</td>
                <td><span class="badge ${getBadgeClass(appointment.status)}">${getStatusText(appointment.status)}</span></td>
                <td>
                    ${getAppointmentActionButtons(appointment)}
                </td>
            </tr>
        `;
    }).join('');
    
    // إضافة معالجات الأحداث للأزرار
    attachTodayAppointmentEventHandlers();
}

/**
 * تحديث قائمة طلبات التحديث
 * @param {Array} requests - قائمة الطلبات
 */
function updatePendingRequests(requests) {
    const requestsList = document.getElementById('latestUpdateRequests');
    if (!requestsList) return;
    
    if (!requests || requests.length === 0) {
        requestsList.innerHTML = '<li class="list-group-item">لا توجد طلبات تحديث معلقة</li>';
        return;
    }
    
    requestsList.innerHTML = requests.map(request => {
        const requestDate = new Date(request.requestDate).toLocaleDateString('ar-SA');
        
        return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${request.fullName}</h6>
                    <small class="text-muted">${getUpdateFieldsSummary(request.updatedFields)}</small>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewUpdateRequest('${request._id}')">عرض</button>
                </div>
            </li>
        `;
    }).join('');
}

/**
 * تحديث مؤشرات الإشعارات
 * @param {Object} stats - إحصائيات النظام
 */
function updateNotificationBadges(stats) {
    // تحديث عدد طلبات التحديث
    const requestsBadge = document.getElementById('userRequestsCount');
    if (requestsBadge) {
        requestsBadge.textContent = stats.updateRequests || 0;
        requestsBadge.style.display = stats.updateRequests > 0 ? 'flex' : 'none';
    }
    
    // تحديث عدد المواعيد المعلقة
    const appointmentsBadge = document.getElementById('appointmentsCount');
    if (appointmentsBadge) {
        const pendingAppointments = stats.todayAppointments - (stats.completedAppointmentsToday || 0);
        appointmentsBadge.textContent = pendingAppointments > 0 ? pendingAppointments : 0;
        appointmentsBadge.style.display = pendingAppointments > 0 ? 'flex' : 'none';
    }
}

/**
 * إضافة معالجات الأحداث لأزرار مواعيد اليوم
 */
function attachTodayAppointmentEventHandlers() {
    // إضافة معالجات للأزرار
    document.querySelectorAll('.action-btn').forEach(button => {
        if (button.classList.contains('btn-success')) {
            button.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                confirmAppointment(appointmentId);
            });
        } else if (button.classList.contains('btn-danger')) {
            button.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                cancelAppointment(appointmentId);
            });
        } else if (button.classList.contains('btn-primary')) {
            button.addEventListener('click', function() {
                const appointmentId = this.getAttribute('data-id');
                completeAppointment(appointmentId);
                completeAppointment(appointmentId);
            });
        }
    });
}

/**
 * الحصول على HTML لتمثيل النشاط
 * @param {Object} activity - بيانات النشاط
 * @returns {string} - كود HTML لعرض النشاط
 */
function getActivityHTML(activity) {
    let iconClass = '';
    let actionClass = '';
    
    // تحديد الأيقونة والكلاس حسب نوع النشاط
    switch (activity.type) {
        case 'appointment':
            iconClass = 'fa-calendar-check';
            actionClass = 'activity-appointment';
            break;
        case 'test':
            iconClass = 'fa-flask';
            actionClass = 'activity-test';
            break;
        case 'update_request':
            iconClass = 'fa-user-edit';
            actionClass = 'activity-update';
            break;
        default:
            iconClass = 'fa-info-circle';
            actionClass = 'activity-general';
    }
    
    return `
        <span class="activity-item ${actionClass}">
            <i class="fas ${iconClass}"></i>
            قام <strong>${activity.user}</strong> بـ${activity.action} 
            <span class="activity-details">${activity.details}</span>
        </span>
    `;
}

/**
 * الحصول على ملخص حقول التحديث
 * @param {Object} updatedFields - الحقول المحدثة
 * @returns {string} - ملخص التحديثات
 */
function getUpdateFieldsSummary(updatedFields) {
    if (!updatedFields || Object.keys(updatedFields).length === 0) {
        return 'تحديث البيانات الشخصية';
    }
    
    const fieldNames = {
        fullName: 'الاسم الكامل',
        phoneNumber: 'رقم الهاتف',
        address: 'العنوان',
        bloodType: 'فصيلة الدم',
        age: 'العمر',
        medicalNotes: 'ملاحظات طبية'
    };
    
    const updatedFieldNames = Object.keys(updatedFields)
        .map(key => fieldNames[key] || key)
        .join(', ');
    
    return `تحديث: ${updatedFieldNames}`;
}

/**
 * الحصول على أزرار العمليات لكل موعد
 * @param {Object} appointment - بيانات الموعد
 * @returns {string} - كود HTML للأزرار
 */
function getAppointmentActionButtons(appointment) {
    let buttons = '';
    
    // إضافة أزرار حسب حالة الموعد
    switch (appointment.status) {
        case 'pending':
            buttons = `
                <button class="btn btn-sm btn-success action-btn" data-id="${appointment._id}">
                    <i class="fas fa-check"></i> تأكيد
                </button>
                <button class="btn btn-sm btn-danger action-btn" data-id="${appointment._id}">
                    <i class="fas fa-times"></i> إلغاء
                </button>
            `;
            break;
            
        case 'confirmed':
            buttons = `
                <button class="btn btn-sm btn-primary action-btn" data-id="${appointment._id}">
                    <i class="fas fa-clipboard-check"></i> تسجيل وصول
                </button>
            `;
            break;
            
        case 'arrived':
            buttons = `
                <button class="btn btn-sm btn-info action-btn" data-id="${appointment._id}">
                    <i class="fas fa-flask"></i> تسجيل النتائج
                </button>
            `;
            break;
    }
    
    return buttons;
}

/**
 * الحصول على كلاس الشارة حسب الحالة
 * @param {string} status - حالة الموعد/التحليل
 * @returns {string} - كلاس CSS للشارة
 */
function getBadgeClass(status) {
    switch (status) {
        case 'pending': return 'bg-warning';
        case 'confirmed': return 'bg-success';
        case 'completed': return 'bg-info';
        case 'cancelled': return 'bg-danger';
        case 'arrived': return 'bg-primary';
        default: return 'bg-secondary';
    }
}

/**
 * الحصول على نص الحالة
 * @param {string} status - حالة الموعد/التحليل
 * @returns {string} - النص العربي للحالة
 */
function getStatusText(status) {
    const statusMap = {
        'pending': 'معلق',
        'confirmed': 'مؤكد',
        'completed': 'مكتمل',
        'cancelled': 'ملغي',
        'arrived': 'تم الوصول'
    };
    
    return statusMap[status] || status;
}

/**
 * تنسيق الوقت المنقضي منذ تاريخ معين
 * @param {Date} date - التاريخ
 * @returns {string} - نص الوقت المنقضي
 */
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
        return `منذ ${diffDay} ${diffDay === 1 ? 'يوم' : 'أيام'}`;
    } else if (diffHour > 0) {
        return `منذ ${diffHour} ${diffHour === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (diffMin > 0) {
        return `منذ ${diffMin} ${diffMin === 1 ? 'دقيقة' : 'دقائق'}`;
    } else {
        return 'منذ لحظات';
    }
}

/**
 * الحصول على اسم نوع التحليل
 * @param {string} type - رمز نوع التحليل
 * @returns {string} - الاسم العربي للتحليل
 */
function getTestTypeName(type) {
    const testTypes = {
        'blood': 'تحليل دم شامل',
        'diabetes': 'تحليل السكر',
        'cholesterol': 'تحليل الكوليسترول',
        'liver': 'وظائف الكبد',
        'kidney': 'وظائف الكلى'
    };
    
    return testTypes[type] || type;
}

/**
 * الحصول على توكن المصادقة
 * @returns {string} - توكن المصادقة
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * إظهار مؤشر التحميل
 */
function showLoadingIndicator() {
    // التحقق من وجود عنصر التحميل
    let loader = document.getElementById('dashboard-loader');
    
    // إنشاء عنصر التحميل إذا لم يكن موجوداً
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'dashboard-loader';
        loader.className = 'loading-overlay';
        loader.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loader);
    }
    
    // إظهار مؤشر التحميل
    loader.style.visibility = 'visible';
    loader.style.opacity = '1';
}

/**
 * إخفاء مؤشر التحميل
 */
function hideLoadingIndicator() {
    const loader = document.getElementById('dashboard-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.visibility = 'hidden';
        }, 300);
    }
}

/**
 * عرض رسالة خطأ
 * @param {string} message - نص الرسالة
 */
function showErrorMessage(message) {
    // التحقق من وجود عنصر الرسائل
    let errorContainer = document.getElementById('error-message-container');
    
    // إنشاء عنصر الرسائل إذا لم يكن موجوداً
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.id = 'error-message-container';
        errorContainer.className = 'error-container';
        document.body.appendChild(errorContainer);
    }
    
    // إنشاء عنصر الرسالة
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button class="close-btn"><i class="fas fa-times"></i></button>
    `;
    
    // إضافة معالج إغلاق الرسالة
    errorMessage.querySelector('.close-btn').addEventListener('click', function() {
        errorMessage.remove();
    });
    
    // إضافة الرسالة للحاوية
    errorContainer.appendChild(errorMessage);
    
    // إزالة الرسالة تلقائياً بعد 5 ثوان
    setTimeout(() => {
        errorMessage.classList.add('removing');
        setTimeout(() => {
            errorMessage.remove();
        }, 300);
    }, 5000);
}

/**
 * تأكيد موعد
 * @param {string} appointmentId - معرف الموعد
 */
async function confirmAppointment(appointmentId) {
    try {
        showLoadingIndicator();
        
        const response = await fetch(`/api/admin/appointments/${appointmentId}/confirm`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'حدث خطأ أثناء تأكيد الموعد');
        }
        
        // تحديث البيانات بعد نجاح العملية
        loadDashboardData();
        
        hideLoadingIndicator();
    } catch (error) {
        console.error('Error confirming appointment:', error);
        showErrorMessage(`فشل تأكيد الموعد: ${error.message}`);
        hideLoadingIndicator();
    }
}

/**
 * إلغاء موعد
 * @param {string} appointmentId - معرف الموعد
 */
async function cancelAppointment(appointmentId) {
    try {
        // طلب سبب الإلغاء
        const reason = prompt('يرجى إدخال سبب إلغاء الموعد:');
        if (reason === null) return; // إلغاء العملية
        
        showLoadingIndicator();
        
        const response = await fetch(`/api/admin/appointments/${appointmentId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'حدث خطأ أثناء إلغاء الموعد');
        }
        
        // تحديث البيانات بعد نجاح العملية
        loadDashboardData();
        
        hideLoadingIndicator();
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        showErrorMessage(`فشل إلغاء الموعد: ${error.message}`);
        hideLoadingIndicator();
    }
}

/**
 * إكمال موعد (تسجيل وصول المريض)
 * @param {string} appointmentId - معرف الموعد
 */
async function completeAppointment(appointmentId) {
    try {
        showLoadingIndicator();
        
        const response = await fetch(`/api/admin/appointments/${appointmentId}/complete`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'حدث خطأ أثناء إكمال الموعد');
        }
        
        // تحديث البيانات بعد نجاح العملية
        loadDashboardData();
        
        hideLoadingIndicator();
    } catch (error) {
        console.error('Error completing appointment:', error);
        showErrorMessage(`فشل إكمال الموعد: ${error.message}`);
        hideLoadingIndicator();
    }
}

/**
 * عرض تفاصيل طلب تحديث
 * @param {string} requestId - معرف طلب التحديث
 */
function viewUpdateRequest(requestId) {
    // التنقل إلى صفحة طلبات التحديث مع تحديد الطلب المطلوب
    window.location.href = `#requests?id=${requestId}`;
}

// بدء تحميل البيانات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من وجود قسم النظرة العامة
    const overviewSection = document.getElementById('overview');
    if (overviewSection && !overviewSection.classList.contains('hidden')) {
        loadDashboardData();
    }
    
    // إضافة معالج حدث للتنقل بين الأقسام
    document.querySelectorAll('.admin-menu a').forEach(link => {
        link.addEventListener('click', function() {
            const targetId = this.getAttribute('href').substring(1);
            
            // تحميل بيانات النظرة العامة عند العودة إليها
            if (targetId === 'overview') {
                loadDashboardData();
            }
        });
    });
    
    // تحديث البيانات كل 2 دقيقة
    setInterval(loadDashboardData, 120000);
});