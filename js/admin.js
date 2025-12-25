// Admin Dashboard JavaScript

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

// Create Overlay
const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        if (sidebar.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });
}

// Close sidebar when clicking overlay
overlay.addEventListener('click', closeSidebar);

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && !overlay.contains(e.target)) {
            closeSidebar();
        }
    }
});

// Registration Chart Removed

// Subjects Chart
const subjectsCtx = document.getElementById('subjectsChart');
if (subjectsCtx) {
    new Chart(subjectsCtx, {
        type: 'doughnut',
        data: {
            labels: ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا'],
            datasets: [{
                data: [250, 180, 320, 200, 150, 145],
                backgroundColor: [
                    '#4A90E2',
                    '#7CB342',
                    '#FF9800',
                    '#E53935',
                    '#9C27B0',
                    '#00BCD4'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: {
                            family: 'Cairo',
                            size: 11
                        },
                        padding: 15
                    }
                }
            }
        }
    });
}

// Notification Badge Click
const notifBtn = document.querySelector('.notif-btn');
if (notifBtn) {
    notifBtn.addEventListener('click', () => {
        alert('عرض الإشعارات (سيتم تفعيلها لاحقاً)');
    });
}

// populate dynamic names from localStorage
(function () {
    try {
        const token = localStorage.getItem('ef_token');
        if (token) {
            fetch('/api/me', { headers: { 'Authorization': 'Bearer ' + token } })
                .then(r => r.ok ? r.json() : null)
                .then(data => {
                    const name = data?.user?.name;
                    if (name) {
                        const el = document.getElementById('newStudentName');
                        if (el) el.innerText = name;
                        const adminProfileName = document.querySelector('.admin-profile span');
                        // optionally update admin profile name if applicable
                    }
                }).catch(() => { });
        } else {
            const name = localStorage.getItem('ef_username');
            if (name) {
                const el = document.getElementById('newStudentName');
                if (el) el.innerText = name;
            }
        }
    } catch (e) { console.warn(e) }
})();

// Data Table Actions
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-edit')) {
        alert('تعديل العنصر');
    }
    if (e.target.classList.contains('btn-delete')) {
        if (confirm('هل أنت متأكد من الحذف؟')) {
            e.target.closest('tr').remove();
        }
    }
    if (e.target.classList.contains('btn-view')) {
        alert('عرض التفاصيل');
    }
});