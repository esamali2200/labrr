document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();
    
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
    
      try {
        // تعديل مسار API ليتطابق مع الباك إند
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
    
        const result = await response.json();
    
        if (response.ok) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          
          // توجيه المستخدم حسب دوره
          if (result.user.role === 'admin') {
            window.location.href = '/pages/admin.html';
          } else if (result.user.role === 'patient') {
            window.location.href = '/pages/patient.html';
          }
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('خطأ في الاتصال:', error);
        alert('حدث خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
      }
    });
  }
});