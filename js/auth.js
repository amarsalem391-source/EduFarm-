// Authentication Form Handling
document.addEventListener('DOMContentLoaded', function() {
    // Toggle Password Visibility
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        });
    });

    // Login Form
    const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const userType = document.getElementById('userType').value;

                if (!email || !password) return;

                // Try backend login first
                try{
                    const resp = await fetch('/api/login', {
                        method: 'POST', headers: {'Content-Type':'application/json'},
                        body: JSON.stringify({ email, password })
                    });
                    if (resp.ok){
                        const data = await resp.json();
                        const name = data?.user?.name || email.split('@')[0];
                        const token = data?.token;
                        if (token) localStorage.setItem('ef_token', token);
                        localStorage.setItem('ef_username', name);
                        // redirect based on selected type
                        if (userType === 'admin') window.location.href = 'admin/dashboard.html';
                        else window.location.href = 'user/dashboard.html';
                        return;
                    }
                }catch(err){
                    // network/backend not available — fallback below
                    console.warn('Backend login failed:', err);
                }

                // Fallback: store basic display name locally and redirect
                let storedName = localStorage.getItem('ef_username');
                let displayName = storedName || email.split('@')[0];
                localStorage.setItem('ef_username', displayName);
                if (userType === 'admin') window.location.href = 'admin/dashboard.html';
                else window.location.href = 'user/dashboard.html';
            });
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const fullname = document.getElementById('fullname')?.value || '';
                const email = document.getElementById('email')?.value || '';
                const phone = document.getElementById('phone')?.value || '';
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const userType = document.getElementById('userType')?.value || 'student';

                if (password !== confirmPassword) {
                    alert('كلمة المرور غير متطابقة!');
                    return;
                }

                // Try backend register
                try{
                    const resp = await fetch('/api/register', {
                        method: 'POST', headers: {'Content-Type':'application/json'},
                        body: JSON.stringify({ fullname, email, phone, password, userType })
                    });
                    if (resp.ok){
                        const data = await resp.json();
                        const name = data?.user?.name || fullname || email.split('@')[0];
                        const token = data?.token;
                        if (token) localStorage.setItem('ef_token', token);
                        localStorage.setItem('ef_username', name);
                        alert('تم إنشاء الحساب بنجاح!');
                        window.location.href = 'login.html';
                        return;
                    }
                    const err = await resp.json().catch(()=>({}));
                    alert('فشل التسجيل: ' + (err.message || resp.statusText));
                    return;
                }catch(err){
                    console.warn('Backend register failed:', err);
                }

                // Fallback local-only behavior
                if (fullname) localStorage.setItem('ef_username', fullname);
                alert('تم إنشاء الحساب بنجاح!');
                window.location.href = 'login.html';
            });
    }

    // Social Login Buttons
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            alert('سيتم تفعيل تسجيل الدخول عبر وسائل التواصل الاجتماعي قريباً');
        });
    });
});