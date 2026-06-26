'use strict';

// ===== PRICING MATRIX =====
const PRICING_MATRIX = {
    tiers: [
        {
            id: 'starter',
            name: 'Starter',
            desc: 'For indie developers and solo teams.',
            baseRates: { INR: 999, USD: 12, EUR: 11 },
            features: [
                '5 data pipelines',
                '10k events/month',
                'Community support',
                'Basic analytics',
                'Single workspace'
            ],
            featured: false
        },
        {
            id: 'pro',
            name: 'Pro',
            desc: 'For fast-moving product teams.',
            baseRates: { INR: 2999, USD: 36, EUR: 33 },
            features: [
                'Unlimited pipelines',
                '500k events/month',
                'Priority support',
                'Advanced analytics',
                'Team collaboration'
            ],
            featured: true
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            desc: 'For data-intensive organizations.',
            baseRates: { INR: 7999, USD: 96, EUR: 89 },
            features: [
                'Unlimited everything',
                'SLA guarantee',
                'Dedicated support',
                'SSO & SAML',
                'Custom integrations'
            ],
            featured: false
        }
    ],
    annualDiscountMultiplier: 0.80,
    currencySymbols: { INR: '₹', USD: '$', EUR: '€' }
};

function computePrice(baseRate, isAnnual) {
    return isAnnual ? Math.round(baseRate * PRICING_MATRIX.annualDiscountMultiplier) : baseRate;
}

// ===== PRICING STATE =====
let currentBilling = 'monthly';
let currentCurrency = 'USD';

// ===== RENDER PRICING CARDS =====
function renderPricingCards() {
    const grid = document.getElementById('pricing-grid');
    grid.innerHTML = '';

    PRICING_MATRIX.tiers.forEach(tier => {
        const card = document.createElement('div');
        card.className = 'pricing-card' + (tier.featured ? ' featured' : '');

        const isAnnual = currentBilling === 'annual';
        const symbol = PRICING_MATRIX.currencySymbols[currentCurrency];
        const price = computePrice(tier.baseRates[currentCurrency], isAnnual);

        card.innerHTML = `
            ${tier.featured ? '<div class="pricing-popular-badge">Most Popular</div>' : ''}
            <div class="pricing-tier-name">${tier.name}</div>
            <div class="pricing-tier-desc">${tier.desc}</div>
            <div class="pricing-price">
                <span class="pricing-amount" data-price-node="${tier.id}">${symbol}${price}</span>
                <span class="pricing-period">/mo</span>
            </div>
            <div class="pricing-features">
                ${tier.features.map(f => `<div class="pricing-feature-item"><span class="pricing-check"></span>${f}</div>`).join('')}
            </div>
            <button class="${tier.featured ? 'btn-primary' : 'btn-outline'}">${tier.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}</button>
        `;

        grid.appendChild(card);
    });

    initPricingSpotlight();
    initCardTilt('.pricing-card');
}

// ===== PRICING SPOTLIGHT (mouse-follow glow) =====
function initPricingSpotlight() {
    const cards = document.querySelectorAll('.pricing-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const mx = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
            const my = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
            card.style.setProperty('--mx', mx);
            card.style.setProperty('--my', my);
        });
    });
}

// ===== UPDATE PRICE NODES =====
function updatePriceNodes() {
    const isAnnual = currentBilling === 'annual';
    const symbol = PRICING_MATRIX.currencySymbols[currentCurrency];

    document.querySelectorAll('[data-price-node]').forEach(span => {
        const tierId = span.getAttribute('data-price-node');
        const tier = PRICING_MATRIX.tiers.find(t => t.id === tierId);
        if (!tier) return;

        const newPrice = `${symbol}${computePrice(tier.baseRates[currentCurrency], isAnnual)}`;

        span.animate([
            { opacity: 1, transform: 'translateY(0) scale(1)' },
            { opacity: 0, transform: 'translateY(-8px) scale(0.95)' }
        ], {
            duration: 150,
            easing: 'ease-out'
        }).onfinish = () => {
            span.textContent = newPrice;
            span.animate([
                { opacity: 0, transform: 'translateY(8px) scale(0.95)' },
                { opacity: 1, transform: 'translateY(0) scale(1)' }
            ], {
                duration: 200,
                easing: 'ease-out'
            });
        };
    });
}

// ===== BILLING TOGGLE =====
function initBillingToggle() {
    const toggle = document.getElementById('billing-toggle');
    const slider = document.getElementById('billing-slider');
    const options = toggle.querySelectorAll('.billing-option');

    function positionSlider() {
        const activeBtn = toggle.querySelector('.billing-option.active');
        if (!activeBtn) return;
        slider.style.width = activeBtn.offsetWidth + 'px';
        slider.style.transform = `translateX(${activeBtn.offsetLeft - 4}px)`;
    }

    options.forEach(btn => {
        btn.addEventListener('click', () => {
            options.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
            currentBilling = btn.getAttribute('data-billing');
            positionSlider();
            updatePriceNodes();
        });
    });

    requestAnimationFrame(positionSlider);
    window.addEventListener('resize', positionSlider);
}

// ===== CURRENCY SELECTOR =====
function initCurrencySelector() {
    const selector = document.getElementById('currency-selector');
    const options = selector.querySelectorAll('.currency-option');

    options.forEach(btn => {
        btn.addEventListener('click', () => {
            options.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-checked', 'true');
            currentCurrency = btn.getAttribute('data-currency');
            updatePriceNodes();
        });
    });
}

// ===== BENTO CARDS =====
window.__activeFeatureIndex = null;

function initBentoCards() {
    const cards = document.querySelectorAll('#bento-grid .bento-card');

    cards.forEach(card => {
        // Mouse-follow glow
        card.addEventListener('mousemove', e => {
            const glow = card.querySelector('.bento-card-glow');
            if (!glow) {
                const newGlow = document.createElement('div');
                newGlow.className = 'bento-card-glow';
                card.prepend(newGlow);
                const rect = card.getBoundingClientRect();
                newGlow.style.left = (e.clientX - rect.left) + 'px';
                newGlow.style.top = (e.clientY - rect.top) + 'px';
                return;
            }
            const rect = card.getBoundingClientRect();
            glow.style.left = (e.clientX - rect.left) + 'px';
            glow.style.top = (e.clientY - rect.top) + 'px';
        });

        card.addEventListener('mouseenter', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            window.__activeFeatureIndex = parseInt(card.getAttribute('data-index'), 10);
        });

        card.addEventListener('mouseleave', () => {
            card.classList.remove('active');
        });
    });
}

// ===== CARD TILT (3D perspective) =====
function initCardTilt(selector) {
    const cards = document.querySelectorAll(selector);
    if (window.matchMedia('(hover: none)').matches) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            const rotateX = -y * 6;
            const rotateY = x * 6;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ===== ACCORDION =====
function openAccordionItem(index) {
    const items = document.querySelectorAll('#accordion-list .accordion-item');
    items.forEach(item => {
        const idx = parseInt(item.getAttribute('data-index'), 10);
        const panel = item.querySelector('.accordion-panel');
        const trigger = item.querySelector('.accordion-trigger');
        if (idx === index) {
            item.classList.add('open');
            panel.style.maxHeight = panel.scrollHeight + 'px';
            trigger.setAttribute('aria-expanded', 'true');
        } else {
            item.classList.remove('open');
            panel.style.maxHeight = '0';
            trigger.setAttribute('aria-expanded', 'false');
        }
    });
    window.__activeFeatureIndex = index;
}

function initAccordion() {
    const items = document.querySelectorAll('#accordion-list .accordion-item');
    items.forEach(item => {
        const trigger = item.querySelector('.accordion-trigger');
        trigger.addEventListener('click', () => {
            const idx = parseInt(item.getAttribute('data-index'), 10);
            if (item.classList.contains('open')) {
                item.classList.remove('open');
                item.querySelector('.accordion-panel').style.maxHeight = '0';
                trigger.setAttribute('aria-expanded', 'false');
                window.__activeFeatureIndex = null;
            } else {
                openAccordionItem(idx);
            }
        });
    });
}

// ===== BREAKPOINT CONTEXT TRANSFER =====
let wasMobile = window.innerWidth < 768;

function handleBreakpointTransfer() {
    const isMobile = window.innerWidth < 768;

    if (wasMobile !== isMobile) {
        if (isMobile && window.__activeFeatureIndex !== null) {
            requestAnimationFrame(() => {
                openAccordionItem(window.__activeFeatureIndex);
            });
        } else if (!isMobile && window.__activeFeatureIndex !== null) {
            const cards = document.querySelectorAll('#bento-grid .bento-card');
            cards.forEach(c => c.classList.remove('active'));
            const target = document.querySelector(`#bento-grid .bento-card[data-index="${window.__activeFeatureIndex}"]`);
            if (target) {
                target.classList.add('active');
                setTimeout(() => target.classList.remove('active'), 2000);
            }
        }
        wasMobile = isMobile;
    }
}

window.addEventListener('resize', handleBreakpointTransfer);

// ===== HEADER SCROLL =====
function initHeaderScroll() {
    const header = document.getElementById('site-header');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                header.classList.toggle('scrolled', window.scrollY > 40);
                ticking = false;
            });
            ticking = true;
        }
    });

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { threshold: 0.4 });

    sections.forEach(s => sectionObserver.observe(s));
}

// ===== CURSOR GLOW =====
function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    if (window.matchMedia('(hover: none)').matches) {
        glow.style.display = 'none';
        return;
    }

    let mouseX = -9999, mouseY = -9999;
    let glowX = -9999, glowY = -9999;
    let raf;

    window.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glow.style.opacity = '1';
    });

    window.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
    });

    function animate() {
        glowX += (mouseX - glowX) * 0.06;
        glowY += (mouseY - glowY) * 0.06;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        raf = requestAnimationFrame(animate);
    }

    animate();
}

// ===== MAGNETIC BUTTONS =====
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta');

    if (window.matchMedia('(hover: none)').matches) return;

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const rect = btn.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) * 0.25;
            const dy = (e.clientY - cy) * 0.25;
            btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.03)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });
}

// ===== RIPPLE EFFECT =====
function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');

    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255,255,255,0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple-anim 600ms ease-out forwards';
            ripple.style.pointerEvents = 'none';

            // Add keyframes if not already present
            if (!document.getElementById('ripple-styles')) {
                const style = document.createElement('style');
                style.id = 'ripple-styles';
                style.textContent = `
                    @keyframes ripple-anim {
                        0% { transform: scale(0); opacity: 1; }
                        100% { transform: scale(8); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ===== PARALLAX EFFECT =====
function initParallax() {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const rate = 0.1;
                heroBg.style.transform = `translateY(${scrolled * rate}px)`;
                ticking = false;
            });
            ticking = true;
        }
    });
}

// ===== FLOATING PARTICLES =====
function initParticles() {
    const container = document.querySelector('.bg-particles');
    if (!container) return;

    // Generate 20 random particles
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        particle.style.setProperty('--x', Math.random() * 100 + '%');
        particle.style.setProperty('--y', Math.random() * 100 + '%');
        particle.style.setProperty('--d', (6 + Math.random() * 8) + 's');
        particle.style.setProperty('--delay', (Math.random() * 10) + 's');
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = `radial-gradient(circle, rgba(255,200,1,${0.3 + Math.random() * 0.5}), transparent)`;
        container.appendChild(particle);
    }
}

// ===== SCROLL REVEALS =====
function initRevealObserver() {
    const baseObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                baseObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => baseObserver.observe(el));

    // Stagger children
    const staggerObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const children = entry.target.querySelectorAll('.bento-card, .pricing-card, .testimonial-card');
            children.forEach((child, i) => {
                child.style.opacity = '0';
                child.style.transform = 'translateY(28px) scale(0.98)';
                child.style.transition = `opacity 480ms cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 480ms cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`;

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        child.style.opacity = '1';
                        child.style.transform = 'translateY(0) scale(1)';
                    });
                });
            });

            staggerObserver.unobserve(entry.target);
        });
    }, { threshold: 0.06 });

    document.querySelectorAll('#bento-grid, .pricing-grid, .testimonials-grid').forEach(el => {
        staggerObserver.observe(el);
    });
}

// ===== COUNTER ANIMATIONS =====
function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-counter'), 10);
                const duration = 2000;
                const start = performance.now();

                function updateCounter(time) {
                    const elapsed = time - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(eased * target);
                    el.textContent = current.toLocaleString() + '+';

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        el.textContent = target.toLocaleString() + '+';
                    }
                }

                requestAnimationFrame(updateCounter);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
}

// ===== FLOATING OBJECTS =====
function initFloatingObjects() {
    const nodes = document.querySelectorAll('.flow-node');

    nodes.forEach((node, index) => {
        const delay = index * 0.3;
        node.style.animation = `float-object ${3 + Math.random() * 2}s ease-in-out ${delay}s infinite`;
    });

    // Add keyframes if not present
    if (!document.getElementById('float-styles')) {
        const style = document.createElement('style');
        style.id = 'float-styles';
        style.textContent = `
            @keyframes float-object {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(2deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== SVG PATH ANIMATIONS =====
function initSVGAnimations() {
    // SVG paths are animated via CSS keyframes already
    // We just ensure the animateMotion elements work
    const motionElements = document.querySelectorAll('animateMotion');
    motionElements.forEach(el => {
        // Ensure they replay on visibility change
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Restart animation by removing and re-adding
                    const parent = el.parentNode;
                    if (parent) {
                        const clone = el.cloneNode(true);
                        parent.replaceChild(clone, el);
                    }
                }
            });
        });

        const parent = el.closest('svg');
        if (parent) {
            observer.observe(parent);
        }
    });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });
}

// ===== HERO NODES =====
function initHeroNodes() {
    const nodes = document.querySelectorAll('.flow-node');
    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            node.style.animationPlayState = 'paused';
            node.style.transform = 'scale(1.15)';
            node.style.boxShadow = '0 0 40px rgba(255,200,1,0.4), 0 0 0 1px rgba(255,200,1,0.5)';
        });
        node.addEventListener('mouseleave', () => {
            node.style.animationPlayState = 'running';
            node.style.transform = '';
            node.style.boxShadow = '';
        });
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    renderPricingCards();
    initBillingToggle();
    initCurrencySelector();
    initBentoCards();
    initAccordion();
    initHeaderScroll();
    initCursorGlow();
    initMagneticButtons();
    initRippleEffect();
    initParallax();
    initParticles();
    initRevealObserver();
    initCounters();
    initFloatingObjects();
    initSVGAnimations();
    initSmoothScroll();
    initHeroNodes();

    // Initialize tilt on existing cards
    setTimeout(() => {
        initCardTilt('.bento-card');
        initCardTilt('.testimonial-card');
    }, 100);
});
