// public/js/appointments.js

// تحميل المواعيد من قاعدة البيانات
async function loadAppointments() {
    try {
        const response = await fetch('/api/appointments', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();
        
        if (response.ok) {
            displayAppointments(data.data);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading appointments:', error);
        alert('حدث خطأ في تحميل المواعيد');
    }
}

// عرض المواعيد في الصفحة
function displayAppointments(appointments) {
    const appointmentsList = document.getElementById('appointmentsList');
    appointmentsList.innerHTML = '';

    if (appointments.length === 0) {
        appointmentsList.innerHTML = `
            <div class="no-appointments">
                <p>لا توجد مواعيد مسجلة</p>
            </div>
        `;
        return;
    }

    appointments.forEach(appointment => {
        const card = document.createElement('div');
        card.className = `appointment-card ${appointment.status}`;
        
        // تنسيق التاريخ والوقت
        const appointmentDate = new Date(appointment.date).toLocaleDateString('ar-SA');
        
        card.innerHTML = `
            <div class="appointment-header">
                <span class="appointment-date">
                    ${appointmentDate} - ${appointment.time}
                </span>
                <span class="appointment-status ${appointment.status}">
                    ${getStatusText(appointment.status)}
                </span>
            </div>
            <div class="appointment-details">
                <p><strong>نوع التحليل:</strong> ${getTestTypeName(appointment.testType)}</p>
                <p><strong>ملاحظات:</strong> ${appointment.notes || 'لا توجد ملاحظات'}</p>
            </div>
            ${getAppointmentActions(appointment)}
        `;
        appointmentsList.appendChild(card);
    });
}

// حجز موعد جديد
async function bookAppointment(appointmentData) {
    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(appointmentData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('تم حجز الموعد بنجاح');
            hideBookingForm();
            loadAppointments(); // إعادة تحميل المواعيد
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert(error.message || 'حدث خطأ في حجز الموعد');
    }
}

// إلغاء موعد
async function cancelAppointment(appointmentId) {
    if (!confirm('هل أنت متأكد من إلغاء هذا الموعد؟')) return;

    try {
        const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            alert('تم إلغاء الموعد بنجاح');
            loadAppointments(); // إعادة تحميل المواعيد
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        alert(error.message || 'حدث خطأ في إلغاء الموعد');
    }
}

// معالجة نموذج حجز موعد جديد
document.getElementById('newAppointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const appointmentData = {
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        testType: document.getElementById('testType').value,
        notes: document.getElementById('notes').value
    };

    await bookAppointment(appointmentData);
});

// تحميل المواعيد عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadAppointments();
});

// الدوال المساعدة تبقى كما هي
function getStatusText(status) {
    const statusMap = {
        'pending': 'قيد الانتظار',
        'confirmed': 'مؤكد',
        'completed': 'مكتمل',
        'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
}

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

function getAppointmentActions(appointment) {
    if (appointment.status === 'pending') {
        return `
            <div class="appointment-actions">
                <button onclick="cancelAppointment('${appointment._id}')" class="btn-danger">
                    إلغاء الموعد
                </button>
            </div>
        `;
    }
    return '';
}

// وظائف عرض/إخفاء نموذج الحجز
function showBookingForm() {
    document.getElementById('bookingForm').classList.remove('hidden');
}

function hideBookingForm() {
    document.getElementById('bookingForm').classList.add('hidden');
    document.getElementById('newAppointmentForm').reset();
}