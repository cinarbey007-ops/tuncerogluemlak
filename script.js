/* ============================================================
   TUNCEROĞLU EMLAKÇILIK — script.js
   All interactive functionality:
   - Navbar scroll + mobile menu
   - Scroll reveal animations
   - Property grid + filtering + add-property CMS
   - Testimonials slider
   - Appointment + Contact form validation & simulation
   - Property detail modal
   - Footer year
   EDIT GUIDE: Search "EDIT:" or "BACKEND:" comments to
   wire up real integrations.
   ============================================================ */

'use strict';

/* ── 1. Navbar ───────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  const links     = navLinks.querySelectorAll('.nav-link');

  // Scroll: add .scrolled class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    highlightActiveLink();
  }, { passive: true });

  // Mobile menu toggle
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Active link based on scroll position
  function highlightActiveLink() {
    const sections = ['hero','about','portfolio','appointment','testimonials','contact'];
    let current = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 200) current = id;
    });
    links.forEach(link => {
      const href = link.getAttribute('href').replace('#','');
      link.classList.toggle('active', href === current);
    });
  }
})();

/* ── 2. Scroll reveal (IntersectionObserver) ─────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!window.IntersectionObserver) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(el => observer.observe(el));
})();

/* ── 3. Properties Data & Grid ───────────────────────────────── */
/*
   EDIT: Replace or extend the 'properties' array below with real data.
   Each object:
     id       (auto-assigned for user additions)
     type     – villa | apartment | commercial | land
     title    – property name
     location – city, country
     price    – display string
     size     – display string
     image    – Unsplash URL (REPLACE with real images)
     desc     – short description
*/
let properties = [
  {
    id: 1,
    type: 'villa',
    title: 'Bosphorus View Villa',
    location: 'Bebek, İstanbul',
    price: '₺48,500,000',
    size: '680 m²',
    // REPLACE: with your real property image
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    desc: 'A landmark estate perched above the Bosphorus, featuring panoramic waterway views, private pool, and six meticulously appointed bedrooms.'
  },
  {
    id: 2,
    type: 'apartment',
    title: 'Iconic Skyline Residence',
    location: 'Levent, İstanbul',
    price: '₺12,800,000',
    size: '210 m²',
    // REPLACE: with your real property image
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    desc: 'Ultra-modern duplex penthouse on the 34th floor with city panoramas, smart home integration, and concierge service.'
  },
  {
    id: 3,
    type: 'villa',
    title: 'Aegean Coastal Villa',
    location: 'Bodrum, Muğla',
    price: '₺31,200,000',
    size: '520 m²',
    // REPLACE: with your real property image
    image: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    desc: 'Sun-drenched Aegean retreat with direct beach access, infinity pool, and traditional Turkish stone architecture reimagined for modern luxury.'
  },
  {
    id: 4,
    type: 'commercial',
    title: 'Boutique Hotel & Spa',
    location: 'Kaleiçi, Antalya',
    price: '₺85,000,000',
    size: '1,850 m²',
    // REPLACE: with your real property image
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    desc: 'Fully operating 28-room boutique hotel in Antalya\'s historic quarter. Exceptional investment with established occupancy rates.'
  },
  {
    id: 5,
    type: 'apartment',
    title: 'Old City Terrace Suite',
    location: 'Sultanahmet, İstanbul',
    price: '₺7,950,000',
    size: '145 m²',
    // REPLACE: with your real property image
    image: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=800&q=80',
    desc: 'Renovated heritage apartment overlooking the Hagia Sophia, blending Ottoman charm with contemporary comfort.'
  },
  {
    id: 6,
    type: 'land',
    title: 'Cappadocia Hilltop Plot',
    location: 'Göreme, Nevşehir',
    price: '₺9,200,000',
    size: '4,200 m²',
    // REPLACE: with your real property image
    image: 'https://images.unsplash.com/photo-1565117196-b4f5f6e8a1c2?w=800&q=80',
    desc: 'Rare development-ready land parcel atop the fairy-chimney valley — ideal for a luxury cave hotel or private estate.'
  },
];

let activeFilter = 'all';
const grid = document.getElementById('propertyGrid');

function renderGrid() {
  const filtered = activeFilter === 'all'
    ? properties
    : properties.filter(p => p.type === activeFilter);

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);padding:3rem;">No properties found in this category.</p>`;
    return;
  }

  grid.innerHTML = filtered.map((p, i) => `
    <article class="prop-card" data-id="${p.id}" style="animation-delay:${i * 0.07}s">
      <div class="prop-img-wrap">
        <img
          src="${escapeHtml(p.image) || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'}"
          alt="${escapeHtml(p.title)}"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'"
        />
        <span class="prop-badge">${capitalise(p.type)}</span>
      </div>
      <div class="prop-body">
        <div class="prop-price">${escapeHtml(p.price)}</div>
        <h3 class="prop-title">${escapeHtml(p.title)}</h3>
        <p class="prop-location">📍 ${escapeHtml(p.location)}</p>
        <div class="prop-meta">
          <span>📐 ${escapeHtml(p.size)}</span>
          <span>🏠 ${capitalise(p.type)}</span>
        </div>
        <p class="prop-desc">${escapeHtml(p.desc)}</p>
      </div>
    </article>
  `).join('');

  // Click → modal
  grid.querySelectorAll('.prop-card').forEach(card => {
    card.addEventListener('click', () => openModal(+card.dataset.id));
  });
}

// Filter buttons
document.getElementById('portfolioFilters').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter;
  renderGrid();
});

renderGrid(); // Initial render

/* ── 4. Add-Property (Frontend CMS) ─────────────────────────── */
const toggleBtn     = document.getElementById('toggleAddProperty');
const panel         = document.getElementById('addPropertyPanel');
const cancelBtn     = document.getElementById('cancelAdd');
const addForm       = document.getElementById('addPropertyForm');

toggleBtn.addEventListener('click', () => {
  const open = panel.style.display !== 'none';
  panel.style.display = open ? 'none' : 'block';
  toggleBtn.querySelector('.btn-icon').textContent = open ? '＋' : '✕';
});

cancelBtn.addEventListener('click', () => {
  panel.style.display = 'none';
  toggleBtn.querySelector('.btn-icon').textContent = '＋';
  addForm.reset();
});

addForm.addEventListener('submit', e => {
  e.preventDefault();

  const title    = document.getElementById('prop-title').value.trim();
  const type     = document.getElementById('prop-type').value;
  const location = document.getElementById('prop-location').value.trim();
  const price    = document.getElementById('prop-price').value.trim();
  const size     = document.getElementById('prop-size').value.trim();
  const image    = document.getElementById('prop-image').value.trim();
  const desc     = document.getElementById('prop-desc').value.trim();

  let valid = true;
  [
    { val: title,    id: 'prop-title' },
    { val: type,     id: 'prop-type' },
    { val: location, id: 'prop-location' },
    { val: price,    id: 'prop-price' },
    { val: size,     id: 'prop-size' },
    { val: desc,     id: 'prop-desc' },
  ].forEach(({ val, id }) => {
    const el = document.getElementById(id);
    if (!val) { el.classList.add('invalid'); valid = false; }
    else el.classList.remove('invalid');
  });

  if (!valid) return;

  properties.unshift({
    id: Date.now(),
    type,
    title,
    location,
    price,
    size,
    image: image || 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
    desc
  });

  // If filter is active and doesn't match, reset to all
  if (activeFilter !== 'all' && activeFilter !== type) {
    activeFilter = 'all';
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === 'all');
    });
  }

  renderGrid();
  addForm.reset();
  panel.style.display = 'none';
  toggleBtn.querySelector('.btn-icon').textContent = '＋';

  // Scroll to grid
  document.getElementById('propertyGrid').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

/* ── 5. Property Modal ───────────────────────────────────────── */
const modalOverlay = document.getElementById('propertyModal');
const modalContent = document.getElementById('modalContent');
const modalClose   = document.getElementById('modalClose');

function openModal(id) {
  const p = properties.find(x => x.id === id);
  if (!p) return;

  modalContent.innerHTML = `
    <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}"
         onerror="this.src='https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80'" />
    <div class="modal-body">
      <div class="prop-price">${escapeHtml(p.price)}</div>
      <div class="prop-title">${escapeHtml(p.title)}</div>
      <div class="prop-location">📍 ${escapeHtml(p.location)} &nbsp;·&nbsp; 📐 ${escapeHtml(p.size)} &nbsp;·&nbsp; 🏠 ${capitalise(p.type)}</div>
      <p class="modal-desc">${escapeHtml(p.desc)}</p>
      <a href="#appointment" class="btn-gold modal-cta" id="modalBookBtn">Request Viewing</a>
    </div>
  `;
  modalOverlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  document.getElementById('modalBookBtn').addEventListener('click', closeModal);
}

function closeModal() {
  modalOverlay.style.display = 'none';
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ── 6. Testimonials Slider ──────────────────────────────────── */
/*
   EDIT: Replace testimonials array with real reviews.
*/
const testimonials = [
  {
    quote: "Working with Tunceroğlu Emlakçılık was a transformative experience. They found our family the perfect Bosphorus-view villa in Istanbul within three weeks — something we thought would take months. Truly exceptional.",
    name: "Ahmet & Selin Yıldırım",
    role: "Residential Buyers, İstanbul",
    stars: 5
  },
  {
    quote: "As a foreign investor, I needed someone who understood both the Turkish market and international expectations. They exceeded every benchmark — professional, transparent, and incredibly knowledgeable.",
    name: "Stefan Müller",
    role: "Commercial Investor, Germany",
    stars: 5
  },
  {
    quote: "The discretion, attention to detail, and market expertise I received was world-class. I've dealt with agents across London, Dubai, and Paris — this was the finest experience of them all.",
    name: "Layla Al-Hassan",
    role: "Luxury Property Buyer, UAE",
    stars: 5
  },
  {
    quote: "They sold my Bodrum villa at a price I never expected and in record time. Every step was handled with professionalism and genuine care. I recommend without hesitation.",
    name: "Canan Demir",
    role: "Property Seller, Bodrum",
    stars: 5
  },
];

(function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('sliderDots');
  let current = 0;
  let autoTimer;

  // Build slides
  track.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <p class="test-quote">${escapeHtml(t.quote)}</p>
      <div class="test-author">
        <div class="test-stars">${'★'.repeat(t.stars)}</div>
        <span class="test-name">${escapeHtml(t.name)}</span>
        <span class="test-role">${escapeHtml(t.role)}</span>
      </div>
    </div>
  `).join('');

  // Build dots
  dotsContainer.innerHTML = testimonials.map((_, i) =>
    `<div class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
  ).join('');

  function goTo(n) {
    current = (n + testimonials.length) % testimonials.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  document.getElementById('prevTest').addEventListener('click', () => { goTo(current - 1); resetTimer(); });
  document.getElementById('nextTest').addEventListener('click', () => { goTo(current + 1); resetTimer(); });

  dotsContainer.addEventListener('click', e => {
    const dot = e.target.closest('.dot');
    if (dot) { goTo(+dot.dataset.index); resetTimer(); }
  });

  function startTimer() { autoTimer = setInterval(() => goTo(current + 1), 5500); }
  function resetTimer() { clearInterval(autoTimer); startTimer(); }
  startTimer();
})();

/* ── 7. Appointment Form ─────────────────────────────────────── */
document.getElementById('appointmentForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fields = [
    { id: 'appt-name',     check: v => v.trim().length > 1 },
    { id: 'appt-email',    check: isValidEmail },
    { id: 'appt-datetime', check: v => v.length > 0 },
  ];

  const feedback = document.getElementById('apptFeedback');
  let valid = validateFields(fields);

  if (!valid) {
    showFeedback(feedback, 'error', 'Please fill in all required fields correctly.');
    return;
  }

  // BACKEND PLACEHOLDER:
  // Replace the block below with your real submission logic.
  // e.g.: fetch('/api/appointment', { method:'POST', body: new FormData(this) })
  simulateSubmit(this, feedback,
    'Your consultation request has been received! We will contact you within 24 hours to confirm your appointment.'
  );
});

/* ── 8. Contact Form ─────────────────────────────────────────── */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const fields = [
    { id: 'cnt-name',    check: v => v.trim().length > 1 },
    { id: 'cnt-email',   check: isValidEmail },
    { id: 'cnt-message', check: v => v.trim().length > 5 },
  ];

  const feedback = document.getElementById('contactFeedback');
  let valid = validateFields(fields);

  if (!valid) {
    showFeedback(feedback, 'error', 'Please complete all required fields correctly.');
    return;
  }

  // BACKEND PLACEHOLDER:
  // Replace the block below with EmailJS, Formspree, or your own API.
  // Example with Formspree: fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: new FormData(this) })
  simulateSubmit(this, feedback,
    'Your message has been sent! We will respond within one business day.'
  );
});

/* ── 9. Utility Functions ────────────────────────────────────── */
function validateFields(fields) {
  let allValid = true;
  fields.forEach(({ id, check }) => {
    const el = document.getElementById(id);
    const val = el.value;
    if (!check(val)) {
      el.classList.add('invalid');
      allValid = false;
    } else {
      el.classList.remove('invalid');
    }
  });
  return allValid;
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function showFeedback(el, type, msg) {
  el.className = `form-feedback ${type}`;
  el.textContent = msg;
}

function simulateSubmit(form, feedback, successMsg) {
  const submitBtn = form.querySelector('[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    showFeedback(feedback, 'success', successMsg);
    form.reset();

    // Clear feedback after 8 seconds
    setTimeout(() => {
      feedback.className = 'form-feedback';
      feedback.textContent = '';
    }, 8000);
  }, 1400);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalise(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/* ── 10. Footer Year ─────────────────────────────────────────── */
document.getElementById('footerYear').textContent = new Date().getFullYear();

/* ── 11. Language Toggle (TR / EN) ──────────────────────────── */
/*
   EDIT: Add real translated string pairs below if you want bilingual support.
   Currently just a placeholder toggle that changes button label.
   For full i18n, populate the 'translations' object and call applyLang().
*/
(function initLangToggle() {
  const btn = document.getElementById('langToggle');
  let lang = 'tr';
  btn.addEventListener('click', () => {
    lang = lang === 'tr' ? 'en' : 'tr';
    btn.textContent = lang === 'tr' ? 'EN / TR' : 'TR / EN';
    // EDIT: Call applyLang(lang) here when translations are ready
  });
})();

/* ── 12. Hero reveal on load ─────────────────────────────────── */
window.addEventListener('load', () => {
  document.querySelectorAll('#hero .reveal-up').forEach(el => {
    el.classList.add('in-view');
  });
});
