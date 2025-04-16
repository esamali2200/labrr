document.addEventListener('DOMContentLoaded', () => {
    // تحميل المكونات (Header & Footer)
    async function loadComponents() {
        try {
            const [headerResponse, footerResponse] = await Promise.all([
                fetch('/components/header.html'),
                fetch('/components/footer.html')
            ]);

            const [headerHtml, footerHtml] = await Promise.all([
                headerResponse.text(),
                footerResponse.text()
            ]);

            const headerPlaceholder = document.getElementById('header-placeholder');
            const footerPlaceholder = document.getElementById('footer-placeholder');

            if (headerPlaceholder) headerPlaceholder.innerHTML = headerHtml;
            if (footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;

            setupMenuButtons();
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    // إرسال بيانات تسجيل المستخدم
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // جمع البيانات من النموذج
            const formData = new FormData(registerForm);
            const data = {
                username: formData.get('username'),
                password: formData.get('password'),
                role: 'patient',
                profile: {
                    fullName: formData.get('fullName'),
                    age: parseInt(formData.get('age')),
                    bloodType: formData.get('bloodType'),
                    phoneNumber: formData.get('phoneNumber'),
                    address: formData.get('address'),
                    medicalNotes: ''
                }
            };

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert('تم تسجيل المستخدم بنجاح!');
                    window.location.href = '/login';
                } else {
                    alert('حدث خطأ أثناء التسجيل: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('حدث خطأ أثناء الاتصال بالخادم.');
            }
        });
    }

    // إعداد أزرار القائمة المتجاوبة
    function setupMenuButtons() {
        const faBars = document.querySelector('.fa-bars');
        const faTimes = document.querySelector('.fa-times');
        if (faBars && faTimes) {
            faBars.addEventListener('click', () => {
                const navLinks = document.getElementById('navLinks');
                if (navLinks) navLinks.style.right = "0";
            });
            faTimes.addEventListener('click', () => {
                const navLinks = document.getElementById('navLinks');
                if (navLinks) navLinks.style.right = "-200px";
            });
        }
    }

    // التنقل بين أقسام الصفحة
    function setupDashboardNavigation() {
        const menuLinks = document.querySelectorAll('.dashboard-menu a');
        const sections = document.querySelectorAll('.dashboard-section');

        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                menuLinks.forEach(l => l.parentElement.classList.remove('active'));
                e.target.parentElement.classList.add('active');
                
                const targetId = e.target.getAttribute('href').substring(1);
                sections.forEach(section => section.classList.add('hidden'));
                document.getElementById(targetId)?.classList.remove('hidden');
            });
        });
    }

    // تشغيل الدوال
    loadComponents();
    setupDashboardNavigation();
});