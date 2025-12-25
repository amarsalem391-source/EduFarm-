// User Dashboard JavaScript

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.user-sidebar');

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// Notification Button
const notifBtn = document.querySelector('.notif-btn');
if (notifBtn) {
    notifBtn.addEventListener('click', () => {
        alert('عرض الإشعارات (سيتم تفعيلها لاحقاً)');
    });
}

// Try to fetch current user from backend using token
window.addEventListener('DOMContentLoaded', async () => {
    try{
        const token = localStorage.getItem('ef_token');
        if (!token) return;
        const resp = await fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + token } });
        if (!resp.ok) return;
        const data = await resp.json();
        const name = data?.user?.name;
        if (name){
            const greet = document.getElementById('greetName');
            const side = document.getElementById('sidebarUserName');
            if (greet) greet.innerText = name;
            if (side) side.innerText = name;
            const img = document.querySelector('.user-profile-sidebar img');
            if (img) img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7CB342&color=fff`;
        }
    }catch(e){ console.warn(e); }
});

// Animate progress bars on load
window.addEventListener('load', () => {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
});