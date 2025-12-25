// Settings Page JavaScript

// Tab Switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Remove active class from all tabs
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
    });
});

// Form Submissions
document.querySelectorAll('.settings-form').forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('تم حفظ التغييرات بنجاح!');
    });
});

// Test Email Button
const btnTest = document.querySelector('.btn-test');
if (btnTest) {
    btnTest.addEventListener('click', () => {
        alert('جاري إرسال بريد تجريبي...');
    });
}

// Backup Button
const btnBackup = document.querySelector('.btn-backup');
if (btnBackup) {
    btnBackup.addEventListener('click', () => {
        alert('جاري إنشاء نسخة احتياطية...');
    });
}

// Restore Button
const btnRestore = document.querySelector('.btn-restore');
if (btnRestore) {
    btnRestore.addEventListener('click', () => {
        if (confirm('هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.')) {
            alert('جاري استعادة البيانات...');
        }
    });
}