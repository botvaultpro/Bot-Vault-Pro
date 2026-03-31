/* =============================================
   BOT VAULT PRO — SCRIPT
   ============================================= */

// ── NAV SCROLL EFFECT ──────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── MOBILE NAV TOGGLE ──────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

// ── SCROLL REVEAL ANIMATIONS ───────────────────
const revealEls = document.querySelectorAll(
  '.bot-card, .step-card, .industry-pill, .benefit-item, .faq-item, .wish-item, .product-card, .pipeline-phase'
);

revealEls.forEach(el => el.classList.add('fade-in-up'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const delay = (i % 6) * 60;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

// ── FAQ ACCORDION ──────────────────────────────
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    document.querySelectorAll('.faq-question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // Toggle current
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ── VOTE SYSTEM ────────────────────────────────
const votedIds = new Set(JSON.parse(localStorage.getItem('bvp_voted') || '[]'));

document.querySelectorAll('.vote-btn').forEach(btn => {
  const id = btn.dataset.id;
  if (votedIds.has(id)) btn.classList.add('voted');

  btn.addEventListener('click', () => {
    if (votedIds.has(id)) return; // already voted
    votedIds.add(id);
    localStorage.setItem('bvp_voted', JSON.stringify([...votedIds]));
    btn.classList.add('voted');

    const countEl = document.getElementById(`votes-${id}`);
    if (countEl) {
      countEl.textContent = parseInt(countEl.textContent) + 1;
      countEl.style.color = 'var(--blue-bright)';
    }
    sortWishList();
  });
});

function sortWishList() {
  const list = document.getElementById('topWishes');
  const items = [...list.querySelectorAll('.wish-item')];
  items.sort((a, b) => {
    const vA = parseInt(a.querySelector('.vote-count').textContent) || 0;
    const vB = parseInt(b.querySelector('.vote-count').textContent) || 0;
    return vB - vA;
  });
  items.forEach(item => list.appendChild(item));
}

// ── WAITLIST COUNT ANIMATION ───────────────────
function animateCount(el, target, duration = 1500) {
  const start = Math.max(0, target - 200);
  const startTime = performance.now();
  const update = (now) => {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
    if (t < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const countEl = document.getElementById('waitlistCount');
const countObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateCount(countEl, 1247);
    countObserver.disconnect();
  }
}, { threshold: 0.5 });
if (countEl) countObserver.observe(countEl);

// ── LOCAL STORAGE HELPERS ──────────────────────
function saveSubmission(key, data) {
  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  existing.push({ ...data, timestamp: new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(existing));
}

// ── FORM VALIDATION ────────────────────────────
function validateField(field) {
  const value = field.value.trim();
  if (field.required && !value) {
    field.classList.add('invalid');
    return false;
  }
  if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    field.classList.add('invalid');
    return false;
  }
  field.classList.remove('invalid');
  return true;
}

function validateForm(form) {
  const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
  let valid = true;
  fields.forEach(f => { if (!validateField(f)) valid = false; });
  return valid;
}

// ── WISHLIST FORM ──────────────────────────────
const wishlistForm    = document.getElementById('wishlistForm');
const wishlistSuccess = document.getElementById('wishlistSuccess');
const wishlistSubmitBtn = document.getElementById('wishlistSubmitBtn');

if (wishlistForm) {
  // Live validation
  wishlistForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => field.classList.remove('invalid'));
  });

  wishlistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(wishlistForm)) return;

    wishlistSubmitBtn.disabled = true;
    wishlistSubmitBtn.innerHTML = '<span>Submitting...</span>';

    const data = {
      name:        document.getElementById('wishName').value.trim(),
      email:       document.getElementById('wishEmail').value.trim(),
      industry:    document.getElementById('wishIndustry').value,
      botName:     document.getElementById('wishBotName').value.trim(),
      description: document.getElementById('wishDescription').value.trim(),
      impact:      document.getElementById('wishImpact').value.trim(),
      priority:    wishlistForm.querySelector('input[name="wishPriority"]:checked')?.value || 'important',
    };

    // Simulate async submission (replace with real API call)
    setTimeout(() => {
      saveSubmission('bvp_wishlists', data);
      wishlistForm.querySelector('.wishlist-form > *:not(.form-success)') // just hide fields
      hideFormFields(wishlistForm);
      wishlistSuccess.hidden = false;
      wishlistSuccess.style.animation = 'none';
      requestAnimationFrame(() => { wishlistSuccess.style.animation = ''; });
    }, 800);
  });
}

// ── WAITLIST FORM ──────────────────────────────
const waitlistForm    = document.getElementById('waitlistForm');
const waitlistSuccess = document.getElementById('waitlistSuccess');
const waitlistSubmitBtn = document.getElementById('waitlistSubmitBtn');

let waitlistSignupCount = parseInt(localStorage.getItem('bvp_wl_count') || '1247');

if (waitlistForm) {
  // Live validation
  waitlistForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => field.classList.remove('invalid'));
  });

  waitlistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(waitlistForm)) return;

    waitlistSubmitBtn.disabled = true;
    waitlistSubmitBtn.innerHTML = '<span>Securing your spot...</span>';

    const data = {
      firstName: document.getElementById('wlFirstName').value.trim(),
      lastName:  document.getElementById('wlLastName').value.trim(),
      email:     document.getElementById('wlEmail').value.trim(),
      company:   document.getElementById('wlCompany').value.trim(),
      role:      document.getElementById('wlRole').value,
      industry:  document.getElementById('wlIndustry').value,
      size:      document.getElementById('wlSize').value,
      painPoint: document.getElementById('wlBiggestPain').value.trim(),
    };

    // Simulate async submission (replace with real API call)
    setTimeout(() => {
      saveSubmission('bvp_waitlist', data);
      waitlistSignupCount++;
      localStorage.setItem('bvp_wl_count', waitlistSignupCount);

      hideFormFields(waitlistForm);
      waitlistSuccess.hidden = false;
      const posEl = document.getElementById('waitlistPosition');
      if (posEl) {
        posEl.textContent = `You are founding member #${waitlistSignupCount.toLocaleString()}`;
      }

      // Update the counter in the social proof section
      if (countEl) {
        animateCount(countEl, waitlistSignupCount, 800);
      }
    }, 800);
  });
}

// ── HIDE FORM FIELDS HELPER ────────────────────
function hideFormFields(form) {
  form.querySelectorAll('.form-group, .form-row, h3, .form-sub, .btn').forEach(el => {
    el.style.display = 'none';
  });
}

// ── SMOOTH SCROLL FOR ANCHOR LINKS ────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ── ACTIVE NAV LINK ON SCROLL ──────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
