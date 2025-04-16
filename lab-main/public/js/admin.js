// public/js/admin.js - الكود الكامل المصحح
console.log('Admin script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    // التحقق من صلاحيات الأدمن
    checkAdminAuth();
    
    // بعد التأكد من تحميل الهيدر
    setTimeout(() => {
        // تحميل البيانات الأولية
        loadDashboardData();
        // إعداد التنقل بين الأقسام
        setupNavigation();
        // عرض اسم الأدمن
        displayAdminInfo();
        
        // استدعاء مباشر للبيانات
        loadUsers();
        loadAppointments();
        loadTests();
        loadUpdateRequests();
    }, 500);
});

// التحقق من صلاحيات الأدمن
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = '/login';
    }
}

// عرض معلومات الأدمن
function displayAdminInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && document.querySelector('.admin-info h3')) {
        document.querySelector('.admin-info h3').textContent = user.profile.fullName || 'مدير النظام';
    } else {
        console.warn('Could not find admin info element');
    }
}

// تحميل بيانات لوحة التحكم
async function loadDashboardData() {
    try {
        // بيانات تجريبية مؤقتة
        const demoData = {
            totalUsers: 15,
            todayAppointments: 8,
            pendingTests: 5,
            updateRequests: 3
        };
        
        updateDashboardStats(demoData);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// تحديث إحصائيات لوحة التحكم
function updateDashboardStats(data) {
    document.getElementById('totalUsers').textContent = data.totalUsers || 0;
    document.getElementById('todayAppointments').textContent = data.todayAppointments || 0;
    document.getElementById('pendingTests').textContent = data.pendingTests || 0;
    document.getElementById('updateRequests').textContent = data.updateRequests || 0;
}

// إعداد التنقل بين الأقسام
function setupNavigation() {
    const menuLinks = document.querySelectorAll('.admin-menu a');
    const sections = document.querySelectorAll('.admin-section');
    const statCards = document.querySelectorAll('.stat-card');

    // إخفاء جميع الأقسام عند بدء التحميل
    sections.forEach(section => {
        if (!section.id.includes('overview')) {
            section.classList.add('hidden');
        }
    });

    // إضافة مستمعي الأحداث لروابط القائمة
    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);

            // تحديث القائمة النشطة
            menuLinks.forEach(l => l.parentElement.classList.remove('active'));
            e.target.parentElement.classList.add('active');

            // إخفاء جميع الأقسام وإظهار القسم المحدد
            sections.forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(targetId).classList.remove('hidden');

            // تحميل بيانات القسم المحدد
            loadSectionData(targetId);
        });
    });

    // إضافة مستمعي الأحداث لبطاقات الإحصائيات
    statCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetSection = card.querySelector('h3').textContent;
            let sectionId = '';
            
            switch(targetSection) {
                case 'المرضى':
                    sectionId = 'users';
                    break;
                case 'المواعيد اليوم':
                    sectionId = 'appointments';
                    break;
                case 'التحاليل المعلقة':
                    sectionId = 'tests';
                    break;
                case 'طلبات التحديث':
                    sectionId = 'requests';
                    break;
            }

            if (sectionId) {
                // تحديث القائمة النشطة
                menuLinks.forEach(l => l.parentElement.classList.remove('active'));
                document.querySelector(`.admin-menu a[href="#${sectionId}"]`).parentElement.classList.add('active');

                // إخفاء جميع الأقسام وإظهار القسم المحدد
                sections.forEach(section => {
                    section.classList.add('hidden');
                });
                document.getElementById(sectionId).classList.remove('hidden');

                // تحميل بيانات القسم المحدد
                loadSectionData(sectionId);
            }
        });
    });
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'users':
            loadUsers();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'tests':
            loadTests();
            break;
        case 'requests':
            loadUpdateRequests();
            break;
    }
}

// تحميل قائمة المستخدمين
async function loadUsers() {
    try {
        // التحقق من وجود توكن المصادقة
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // إرسال طلب جلب المستخدمين
        const response = await fetch('/api/admin/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // التحقق من نجاح الطلب
        if (!response.ok) {
            throw new Error('فشل في جلب المستخدمين');
        }

        // تحويل الاستجابة إلى JSON
        const result = await response.json();

        // التحقق من صحة البيانات
        if (!result.success || !result.data) {
            throw new Error('تنسيق البيانات غير صالح');
        }

        // عرض المستخدمين
        displayUsers(result.data);
    } catch (error) {
        console.error('خطأ في جلب المستخدمين:', error);
        const usersList = document.getElementById('usersList');
        if (usersList) {
            usersList.innerHTML = '<div class="error">حدث خطأ أثناء جلب المستخدمين</div>';
        }
    }
}

// عرض المستخدمين في الجدول
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';

    // إعداد التصفح الصفحي
    const itemsPerPage = 5;
    const totalPages = Math.ceil(users.length / itemsPerPage);
    let currentPage = 1;

    function displayPage(page) {
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageUsers = users.slice(start, end);

        usersList.innerHTML = pageUsers.map(user => `
            <div class="user-card">
                <div class="user-card-header">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-status ${user.isActive ? 'active' : 'inactive'}">
                        ${user.isActive ? 'نشط' : 'غير نشط'}
                    </div>
                </div>
                <div class="user-card-body">
                    <h3>${user.profile?.fullName || '-'}</h3>
                    <div class="user-info">
                        <p><i class="fas fa-user"></i> ${user.username}</p>
                        <p><i class="fas fa-phone"></i> ${user.profile?.phoneNumber || '-'}</p>
                        <p><i class="fas fa-tint"></i> ${user.profile?.bloodType || '-'}</p>
                        <p><i class="fas fa-birthday-cake"></i> ${user.profile?.age || '-'}</p>
                    </div>
                </div>
                <div class="user-card-actions">
                    <button class="btn btn-info" onclick="window.location.href='/pages/user-details.html?id=${user._id}'">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                    <button class="btn ${user.isActive ? 'btn-danger' : 'btn-success'}" 
                            onclick="toggleUserStatus('${user._id}', ${!user.isActive})">
                        <i class="fas ${user.isActive ? 'fa-user-slash' : 'fa-user-check'}"></i>
                        ${user.isActive ? 'إلغاء التنشيط' : 'تنشيط'}
                    </button>
                </div>
            </div>
        `).join('');

        // تحديث أزرار التصفح
        updatePagination();
    }

    function updatePagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) {
            const newPagination = document.createElement('div');
            newPagination.id = 'pagination';
            newPagination.className = 'pagination';
            usersList.parentNode.appendChild(newPagination);
        }

        const paginationHTML = `
            <button class="pagination-btn ${currentPage === 1 ? 'disabled' : ''}" 
                    onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
            <span class="page-info">الصفحة ${currentPage} من ${totalPages}</span>
            <button class="pagination-btn ${currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        document.getElementById('pagination').innerHTML = paginationHTML;
    }

    window.changePage = function(newPage) {
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            displayPage(currentPage);
        }
    };

    // عرض الصفحة الأولى
    displayPage(currentPage);
}

// تحميل المواعيد
async function loadAppointments() {
    console.log('Loading appointments data...');
    try {
        // بيانات تجريبية
        const demoAppointments = [
            {
                _id: 'a1',
                patient: {
                    profile: {
                        fullName: 'محمد أحمد'
                    }
                },
                date: new Date('2025-02-25'),
                time: '10:00',
                testType: 'blood',
                status: 'pending'
            },
            {
                _id: 'a2',
                patient: {
                    profile: {
                        fullName: 'فاطمة علي'
                    }
                },
                date: new Date('2025-02-26'),
                time: '11:30',
                testType: 'diabetes',
                status: 'confirmed'
            },
            {
                _id: 'a3',
                patient: {
                    profile: {
                        fullName: 'أحمد خالد'
                    }
                },
                date: new Date('2025-02-24'),
                time: '09:15',
                testType: 'liver',
                status: 'completed'
            }
        ];
        
        displayAppointments(demoAppointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// عرض المواعيد
function displayAppointments(appointments) {
    console.log('Displaying appointments:', appointments);
    const appointmentsList = document.getElementById('appointmentsList');
    if (!appointmentsList) {
        console.error('appointmentsList element not found');
        return;
    }
    
    if (appointments.length === 0) {
        appointmentsList.innerHTML = '<div class="no-data">لا توجد مواعيد</div>';
        return;
    }
    
    appointmentsList.innerHTML = appointments.map(appointment => `
        <div class="appointment-card ${appointment.status}">
            <div class="appointment-header">
                <h3>${appointment.patient.profile.fullName}</h3>
                <span class="appointment-status ${appointment.status}">
                    ${getAppointmentStatusText(appointment.status)}
                </span>
            </div>
            <div class="appointment-details">
                <p><strong>التاريخ:</strong> ${new Date(appointment.date).toLocaleDateString('ar-SA')}</p>
                <p><strong>الوقت:</strong> ${appointment.time}</p>
                <p><strong>نوع التحليل:</strong> ${getTestTypeName(appointment.testType)}</p>
            </div>
            <div class="appointment-actions">
                ${getAppointmentActionButtons(appointment)}
            </div>
        </div>
    `).join('');
    console.log('Appointments display completed');
}

// الأزرار المناسبة لحالة الموعد
function getAppointmentActionButtons(appointment) {
    if (appointment.status === 'pending') {
        return `
            <button onclick="confirmAppointment('${appointment._id}')" class="btn btn-success">
                <i class="fas fa-check"></i> تأكيد
            </button>
            <button onclick="cancelAppointment('${appointment._id}')" class="btn btn-danger">
                <i class="fas fa-times"></i> إلغاء
            </button>
        `;
    } else if (appointment.status === 'confirmed') {
        return `
            <button onclick="completeAppointment('${appointment._id}')" class="btn btn-primary">
                <i class="fas fa-clipboard-check"></i> إكمال
            </button>
            <button onclick="cancelAppointment('${appointment._id}')" class="btn btn-danger">
                <i class="fas fa-times"></i> إلغاء
            </button>
        `;
    }
    return '';
}

// تأكيد موعد
function confirmAppointment(id) {
    alert('تم تأكيد الموعد: ' + id);
    loadAppointments();
}

// إلغاء موعد
function cancelAppointment(id) {
    if (confirm('هل أنت متأكد من إلغاء الموعد؟')) {
        alert('تم إلغاء الموعد: ' + id);
        loadAppointments();
    }
}

// إكمال موعد
function completeAppointment(id) {
    alert('تم إكمال الموعد: ' + id);
    loadAppointments();
}

// تحميل التحاليل
async function loadTests() {
    console.log('Loading tests data...');
    try {
        // بيانات تجريبية
        const demoTests = [
            {
                _id: 't1',
                patient: {
                    profile: {
                        fullName: 'أحمد محمد'
                    }
                },
                testType: 'blood',
                testDate: new Date('2025-02-20'),
                status: 'pending'
            },
            {
                _id: 't2',
                patient: {
                    profile: {
                        fullName: 'فاطمة علي'
                    }
                },
                testType: 'kidney',
                testDate: new Date('2025-02-18'),
                status: 'completed',
                results: {
                    summary: 'النتائج طبيعية'
                }
            }
        ];
        
        displayTests(demoTests);
    } catch (error) {
        console.error('Error loading tests:', error);
    }
}

// عرض التحاليل
function displayTests(tests) {
    console.log('Displaying tests:', tests);
    const testsList = document.getElementById('testsList');
    if (!testsList) {
        console.error('testsList element not found');
        return;
    }
    
    if (tests.length === 0) {
        testsList.innerHTML = '<div class="no-data">لا توجد تحاليل</div>';
        return;
    }
    
    testsList.innerHTML = tests.map(test => `
        <div class="test-card ${test.status}">
            <div class="test-header">
                <h3>${test.patient.profile.fullName}</h3>
                <span class="test-status ${test.status}">
                    ${getTestStatusText(test.status)}
                </span>
            </div>
            <div class="test-details">
                <p><strong>نوع التحليل:</strong> ${getTestTypeName(test.testType)}</p>
                <p><strong>التاريخ:</strong> ${new Date(test.testDate).toLocaleDateString('ar-SA')}</p>
                ${test.status === 'completed' ? `<p><strong>النتائج:</strong> ${test.results.summary}</p>` : ''}
            </div>
            <div class="test-actions">
                ${test.status === 'pending' ? `
                    <button onclick="uploadTestResults('${test._id}')" class="btn btn-primary">
                        <i class="fas fa-upload"></i> رفع النتائج
                    </button>
                ` : `
                    <button onclick="viewTestDetails('${test._id}')" class="btn btn-primary">
                        <i class="fas fa-eye"></i> عرض التفاصيل
                    </button>
                `}
            </div>
        </div>
    `).join('');
    console.log('Tests display completed');
}

// رفع نتائج التحليل
function uploadTestResults(id) {
    alert('سيتم فتح نموذج رفع النتائج للتحليل: ' + id);
}

// عرض تفاصيل التحليل
function viewTestDetails(id) {
    alert('سيتم عرض تفاصيل التحليل: ' + id);
}

// تحميل طلبات تحديث البيانات
async function loadUpdateRequests() {
    console.log('Loading update requests data...');
    try {
        // بيانات تجريبية
        const demoRequests = [
            {
                _id: '1',
                patient: {
                    _id: '101',
                    profile: {
                        fullName: 'أحمد محمد'
                    }
                },
                profileUpdateRequest: {
                    status: 'pending',
                    requestDate: new Date('2025-02-15'),
                    updatedFields: {
                        phoneNumber: '0598765432',
                        address: 'العنوان الجديد'
                    }
                }
            },
            {
                _id: '2',
                patient: {
                    _id: '102',
                    profile: {
                        fullName: 'فاطمة علي'
                    }
                },
                profileUpdateRequest: {
                    status: 'pending',
                    requestDate: new Date('2025-02-16'),
                    updatedFields: {
                        bloodType: 'A+',
                        medicalNotes: 'تحديث الملاحظات الطبية'
                    }
                }
            }
        ];

        displayUpdateRequests(demoRequests);
    } catch (error) {
        console.error('Error loading update requests:', error);
    }
}

// عرض طلبات التحديث
function displayUpdateRequests(requests) {
    console.log('Displaying update requests:', requests);
    const requestsList = document.getElementById('updateRequestsList');
    if (!requestsList) {
        console.error('updateRequestsList element not found');
        return;
    }
    
    if (requests.length === 0) {
        requestsList.innerHTML = '<div class="no-data">لا توجد طلبات تحديث معلقة</div>';
        return;
    }

    requestsList.innerHTML = requests.map(request => `
        <div class="update-request-card">
            <div class="request-header">
                <div class="request-user">
                    <h3>${request.patient.profile.fullName}</h3>
                    <span class="request-date">
                        ${new Date(request.profileUpdateRequest.requestDate).toLocaleDateString('ar-SA')}
                    </span>
                </div>
                <span class="request-status ${request.profileUpdateRequest.status}">
                    ${getRequestStatusText(request.profileUpdateRequest.status)}
                </span>
            </div>
            <div class="request-details">
                ${getUpdatedFieldsHTML(request.profileUpdateRequest.updatedFields)}
            </div>
            <div class="request-actions">
                <button onclick="approveRequest('${request._id}')" class="btn btn-success">
                    <i class="fas fa-check"></i> موافقة
                </button>
                <button onclick="rejectRequest('${request._id}')" class="btn btn-danger">
                    <i class="fas fa-times"></i> رفض
                </button>
            </div>
        </div>
    `).join('');
    console.log('Update requests display completed');
}

// الحصول على نص حالة الطلب
function getRequestStatusText(status) {
    const statusMap = {
        'pending': 'معلق',
        'approved': 'تمت الموافقة',
        'rejected': 'مرفوض'
    };
    return statusMap[status] || status;
}

// الحصول على نص حالة الموعد
function getAppointmentStatusText(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'confirmed': 'مؤكد',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
}

// الحصول على نص حالة التحليل
function getTestStatusText(status) {
    const statusMap = {
        'pending': 'قيد المعالجة',
        'completed': 'مكتمل'
    };
    return statusMap[status] || status;
}

// تحويل الحقول المحدثة إلى HTML
function getUpdatedFieldsHTML(fields) {
    if (!fields || Object.keys(fields).length === 0) {
        return '<p>لا توجد تغييرات</p>';
    }

    const fieldNames = {
        fullName: 'الاسم الكامل',
        phoneNumber: 'رقم الهاتف',
        address: 'العنوان',
        bloodType: 'فصيلة الدم',
        age: 'العمر',
        medicalNotes: 'ملاحظات طبية'
    };

    return Object.entries(fields).map(([key, value]) => {
        return `
            <div class="updated-field">
                <span class="field-name">${fieldNames[key] || key}:</span>
                <span class="field-value">${value}</span>
            </div>
        `;
    }).join('');
}

// الموافقة على طلب التحديث
async function approveRequest(requestId) {
    if (!confirm('هل أنت متأكد من الموافقة على طلب التحديث؟')) return;

    try {
        // للعرض التجريبي فقط
        alert('تمت الموافقة على الطلب بنجاح');
        loadUpdateRequests();
    } catch (error) {
        alert('حدث خطأ: ' + error.message);
    }
}

// رفض طلب التحديث
async function rejectRequest(requestId) {
    const reason = prompt('يرجى إدخال سبب الرفض:');
    if (reason === null) return; // إلغاء العملية

    try {
        // للعرض التجريبي فقط
        alert('تم رفض الطلب بنجاح');
        loadUpdateRequests();
    } catch (error) {
        alert('حدث خطأ: ' + error.message);
    }
}

// عرض تفاصيل المستخدم
function viewUserDetails(userId) {
    // الانتقال إلى صفحة تفاصيل المستخدم
    window.location.href = `/pages/user-details.html?id=${userId}`;
}

// حظر مستخدم
function blockUser(userId) {
    if (confirm('هل أنت متأكد من حظر هذا المستخدم؟')) {
        alert('تم حظر المستخدم بنجاح');
        loadUsers();
    }
}

// تسجيل الخروج
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
});

// دوال مساعدة
function getTestTypeName(type) {
    const types = {
        'blood': 'تحليل دم شامل',
        'diabetes': 'تحليل السكر',
        'cholesterol': 'تحليل الكوليسترول',
        'liver': 'وظائف الكبد',
        'kidney': 'وظائف الكلى'
    };
    return types[type] || type;
}

// إظهار كل الأقسام عند تحميل الصفحة (مؤقتاً للاختبار)
window.showAllSections = function() {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('hidden');
        section.style.marginBottom = '50px';
        section.style.borderTop = '5px solid #007bff';
        section.style.paddingTop = '30px';
    });
}