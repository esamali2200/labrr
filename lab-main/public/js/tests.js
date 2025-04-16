// public/js/tests.js

// بيانات تجريبية للتحاليل
const sampleTests = [
    {
        _id: '1',
        testType: 'blood',
        testDate: '2025-02-15',
        status: 'completed',
        results: {
            summary: 'نتائج تحليل الدم طبيعية',
            values: [
                { name: 'الهيموجلوبين', value: 14.5, unit: 'g/dL', normalRange: '13.5-17.5' },
                { name: 'كريات الدم البيضاء', value: 7.5, unit: '10^9/L', normalRange: '4.5-11.0' }
            ]
        }
    },
    {
        _id: '2',
        testType: 'diabetes',
        testDate: '2025-02-16',
        status: 'pending',
        notes: 'تحليل سكر صائم'
    },
    {
        _id: '3',
        testType: 'liver',
        testDate: '2025-02-14',
        status: 'completed',
        results: {
            summary: 'وظائف الكبد ضمن المعدل الطبيعي',
            values: [
                { name: 'ALT', value: 25, unit: 'U/L', normalRange: '7-56' },
                { name: 'AST', value: 28, unit: 'U/L', normalRange: '10-40' }
            ]
        }
    }
];

// عرض التحاليل في الصفحة
function displayTests(tests) {
    const testsList = document.getElementById('testsList');
    testsList.innerHTML = '';

    if (tests.length === 0) {
        testsList.innerHTML = `
            <div class="no-tests">
                <p>لا توجد تحاليل حالياً</p>
            </div>
        `;
        return;
    }

    tests.forEach(test => {
        const card = document.createElement('div');
        card.className = `test-card ${test.status}`;
        card.innerHTML = `
            <div class="test-header">
                <div class="test-info">
                    <h3>${getTestTypeName(test.testType)}</h3>
                    <span class="test-date">${new Date(test.testDate).toLocaleDateString('ar-SA')}</span>
                </div>
                <span class="test-status ${test.status}">
                    ${getStatusText(test.status)}
                </span>
            </div>
            <div class="test-details">
                ${test.status === 'completed' ? getTestResultsHtml(test.results) : 'التحليل قيد المعالجة'}
            </div>
            <div class="test-actions">
                ${test.status === 'completed' ? `
                    <button class="btn-primary" onclick="viewResults('${test._id}')">
                        عرض النتائج
                    </button>
                    <button class="btn-secondary" onclick="showShareForm('${test._id}')">
                        مشاركة النتائج
                    </button>
                    <a href="#" class="btn-primary" onclick="downloadPDF('${test._id}')">
                        تحميل PDF
                    </a>
                ` : ''}
            </div>
        `;
        testsList.appendChild(card);
    });
}

// الحصول على نص حالة التحليل
function getStatusText(status) {
    const statusMap = {
        'pending': 'قيد المعالجة',
        'completed': 'مكتمل'
    };
    return statusMap[status] || status;
}

// الحصول على اسم نوع التحليل
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

// تحويل نتائج التحليل إلى HTML
function getTestResultsHtml(results) {
    if (!results || !results.values) return '';

    let html = `<div class="results-summary">${results.summary || ''}</div>`;
    
    html += '<div class="results-values">';
    results.values.forEach(value => {
        html += `
            <div class="test-value">
                <span class="value-name">${value.name}</span>
                <span class="value-data">
                    ${value.value} ${value.unit}
                    <small>(المعدل الطبيعي: ${value.normalRange})</small>
                </span>
            </div>
        `;
    });
    html += '</div>';

    return html;
}

// فلترة التحاليل
function filterTests() {
    const status = document.getElementById('testStatusFilter').value;
    if (status === 'all') {
        displayTests(sampleTests);
    } else {
        const filtered = sampleTests.filter(test => test.status === status);
        displayTests(filtered);
    }
}

// عرض نموذج المشاركة
function showShareForm(testId) {
    document.getElementById('shareTestForm').classList.remove('hidden');
    document.getElementById('shareTestForm').dataset.testId = testId;
}

// إخفاء نموذج المشاركة
function hideShareForm() {
    document.getElementById('shareTestForm').classList.add('hidden');
}

// تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    displayTests(sampleTests);
});