// Mobile nav toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            // In production, this would search your content/database
            alert('Search for: "' + query + '"\n\nConnect this to your review database or CMS.');
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });
}

// Newsletter form
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;

        // In production, send to your email service (Mailchimp, ConvertKit, etc.)
        console.log('Newsletter signup:', email);

        const btn = newsletterForm.querySelector('button');
        btn.textContent = 'Subscribed!';
        btn.style.background = '#10b981';
        newsletterForm.reset();

        setTimeout(() => {
            btn.textContent = 'Subscribe';
            btn.style.background = '';
        }, 3000);
    });
}

// Scroll animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.product-card, .category-card, .review-card, .deal-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(15px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// Navbar shadow on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.pageYOffset > 30
        ? '0 2px 20px rgba(0,0,0,0.08)'
        : 'none';
});
