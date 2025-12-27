// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards
document.querySelectorAll('.card, .feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s ease-out';
    observer.observe(card);
});

// Active navigation
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-menu a[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            if (navLink) {
                document.querySelectorAll('.nav-menu a').forEach(link => {
                    link.classList.remove('active');
                });
                navLink.classList.add('active');
            }
        }
    });
});

// Helpers: slugify for generating a filename from title
function slugify(text){
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-\u0600-\u06FF]+/g, '') // Remove all non-word chars (allow Arabic)
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

// Modal and view button handlers
const modal = document.getElementById('itemModal');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalDesc = document.getElementById('modalDesc');
const modalDownload = document.getElementById('modalDownload');

// Delegated click handler for buttons (works for dynamically added buttons too)
document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.btn-view');
    if (btn) {
        e.preventDefault();
        const card = btn.closest('.item-card');
        if (!card) return;
        const title = card.querySelector('h3')?.innerText || '';
        const desc = card.querySelector('.item-description')?.innerText || '';
        const metaSpans = card.querySelectorAll('.item-meta span');
        const subject = metaSpans[0]?.innerText || '';
        const grade = metaSpans[1]?.innerText || '';
        modalTitle.innerText = title;
        modalMeta.innerText = `${subject} • ${grade}`;
        modalDesc.innerText = desc;
        const pdfLink = `pdfs/${slugify(title)}.pdf`;
        modalDownload.href = pdfLink;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        return;
    }

    // handle pagination buttons (delegated)
    const pageBtn = e.target.closest && e.target.closest('.page-btn');
    if (pageBtn) {
        e.preventDefault();
        document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
        pageBtn.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
});

// Close modal handlers
document.querySelectorAll('.modal-close, #modalCloseBtn').forEach(el => {
    if (!el) return;
    el.addEventListener('click', () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    });
});
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    });
}

// Pagination buttons simple handler (toggle active)
document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // TODO: load real page data if available
    });
});

// Grade filtering: show/hide .item-card by data-grade attribute
function filterByGrade(value){
    const cards = document.querySelectorAll('.item-card');
    cards.forEach(card => {
        const g = card.dataset.grade;
        if (!value || value === '') {
            card.style.display = '';
        } else {
            if (g === value) card.style.display = '';
            else card.style.display = 'none';
        }
    });
}

document.querySelectorAll('.grade-select').forEach(select => {
    select.addEventListener('change', (e) => {
        filterByGrade(e.target.value);
    });
});

// If there's an initial selection, apply it on load
document.addEventListener('DOMContentLoaded', () => {
    const sel = document.querySelector('.grade-select');
    if (sel && sel.value) filterByGrade(sel.value);
});

// Theme toggle: persist user preference
function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('dark-theme');
    else document.documentElement.classList.remove('dark-theme');
}

const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-theme');
        localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
        // update aria-pressed for accessibility
        themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
}

// Apply saved theme on load
const savedTheme = localStorage.getItem('site-theme');
if (savedTheme) applyTheme(savedTheme);