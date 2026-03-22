// ===========================
// ZHE PAY — MAIN SCRIPT
// ===========================

document.addEventListener('DOMContentLoaded', () => {

    // --- Dynamic year ---
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- Mobile nav toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // --- Hero services stack animation ---
    const stackItems = document.querySelectorAll('.hero-service-item');
    const totalItems = stackItems.length;
    const dots = document.querySelectorAll('.hero-dot');
    let currentIndex = 0;
    let stackInterval;

    // Set topbar colors from data-color
    stackItems.forEach(item => {
        const color = item.getAttribute('data-color');
        if (color) {
            item.querySelector('.hero-service-topbar').style.background = color;
        }
    });

    function updateStack() {
        stackItems.forEach(item => {
            item.classList.remove('active', 'behind-1', 'behind-2', 'exiting');
        });
        dots.forEach(d => d.classList.remove('active'));

        const activeIdx = currentIndex % totalItems;
        const behind1Idx = (currentIndex + 1) % totalItems;
        const behind2Idx = (currentIndex + 2) % totalItems;

        stackItems[activeIdx].classList.add('active');
        stackItems[behind1Idx].classList.add('behind-1');
        stackItems[behind2Idx].classList.add('behind-2');

        if (dots[activeIdx]) dots[activeIdx].classList.add('active');
    }

    function startStackInterval() {
        stackInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalItems;
            updateStack();
        }, 3200);
    }

    if (totalItems > 0) {
        updateStack();
        startStackInterval();
    }

    // Click on dots to navigate
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(stackInterval);
            currentIndex = parseInt(dot.getAttribute('data-dot'), 10);
            updateStack();
            startStackInterval();
        });
    });

    // --- Touch swipe on hero services stack ---
    const stackContainer = document.getElementById('heroServicesStack');
    if (stackContainer) {
        let touchStartX = 0;
        let touchEndX = 0;

        stackContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        stackContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 40) {
                clearInterval(stackInterval);
                if (diff > 0) {
                    currentIndex = (currentIndex + 1) % totalItems;
                } else {
                    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
                }
                updateStack();
                startStackInterval();
            }
        }, { passive: true });
    }

    // --- Animated counter ---
    const counters = document.querySelectorAll('.stat-number[data-target]');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.round(eased * target);

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target;
                }
            }

            requestAnimationFrame(update);
        });
    }

    // --- FAQ Accordion ---
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isOpen = item.classList.contains('active');
            document.querySelectorAll('.faq-item.active').forEach(el => {
                el.classList.remove('active');
                el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // --- Scroll animations (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add fade-in to elements
    const animatedElements = document.querySelectorAll(
        '.intro-card, .service-card, .testimonial-card, .about-grid, .payslip, .contact-grid'
    );
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Counter trigger on hero stats visible
    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    // --- Contact form handling ---
    const form = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Envoi en cours...';

            fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                if (response.ok) {
                    form.style.display = 'none';
                    formSuccess.style.display = 'block';
                    form.reset();
                } else {
                    alert('Une erreur est survenue. Veuillez r\u00e9essayer.');
                }
            }).catch(() => {
                alert('Erreur de connexion. Veuillez r\u00e9essayer.');
            }).finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Envoyer ma demande de devis';
            });
        });
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = targetEl.offsetTop - navHeight - 10;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Active nav link highlight ---
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');

            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            if (link) {
                if (scrollPos >= top && scrollPos < bottom) {
                    link.style.color = 'var(--primary)';
                    link.style.background = 'var(--primary-bg)';
                } else {
                    link.style.color = '';
                    link.style.background = '';
                }
            }
        });
    });

});
