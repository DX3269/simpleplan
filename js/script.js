/* ============================================================
   SimplePlan Media — interactions (vanilla JS)
   ============================================================ */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ------------------------------------------------------------
     1. Sticky header shadow
  ------------------------------------------------------------ */
  const header = $('#siteHeader');
  const onScrollHeader = () => header.classList.toggle('scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ------------------------------------------------------------
     2. CATEGORIES mega dropdown (desktop)
  ------------------------------------------------------------ */
  const catTrigger = $('#catTrigger');
  const catPanel = $('#catPanel');

  const setPanel = (open) => {
    header.classList.toggle('open', open);
    catTrigger.setAttribute('aria-expanded', String(open));
    catPanel.setAttribute('aria-hidden', String(!open));
  };
  catTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setPanel(!header.classList.contains('open'));
  });
  // close on outside click / Esc / nav away
  document.addEventListener('click', (e) => {
    if (header.classList.contains('open') && !catPanel.contains(e.target) && e.target !== catTrigger) setPanel(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { setPanel(false); closeMobile(); chatWidget.classList.remove('open'); }
  });
  catPanel.addEventListener('click', (e) => { if (e.target.closest('a')) setPanel(false); });

  /* ------------------------------------------------------------
     3. Mobile drawer + accordion
  ------------------------------------------------------------ */
  const burger = $('#burger');
  const drawer = $('#mobileDrawer');
  const drawerCatTrigger = $('#drawerCatTrigger');
  const drawerCatList = $('#drawerCatList');

  const closeMobile = () => {
    header.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  };
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !header.classList.contains('menu-open');
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    $('#mobileDrawer').setAttribute('aria-hidden', String(!open));
    if (!open) drawerCatList.hidden = true;
  });
  drawerCatTrigger.addEventListener('click', () => {
    const open = drawerCatList.hidden;
    drawerCatList.hidden = !open;
    drawerCatTrigger.setAttribute('aria-expanded', String(open));
  });
  $$('#mobileDrawer a').forEach((a) => a.addEventListener('click', (e) => {
    if (a.getAttribute('href') === '#') e.preventDefault();
    closeMobile();
  }));
  document.addEventListener('click', (e) => {
    if (header.classList.contains('menu-open') && !e.target.closest('.mobile-drawer') && !e.target.closest('#burger')) closeMobile();
  });

  /* ------------------------------------------------------------
     4. Currency toggle (NOK / INR)
  ------------------------------------------------------------ */
  const currencyToggle = $('#currencyToggle');
  currencyToggle.addEventListener('click', (e) => {
    const seg = e.target.closest('.cur-seg');
    if (!seg || seg.classList.contains('active')) return;
    const cur = seg.dataset.cur;
    $$('.cur-seg', currencyToggle).forEach((b) => {
      const on = b === seg;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $$('.card').forEach((card) => {
      const now = $('.price-now', card);
      const old = $('.price-old', card);
      now.textContent = card.dataset[cur.toLowerCase()];
      if (old) old.textContent = card.dataset[`${cur.toLowerCase()}Old`];
    });
  });

  /* ------------------------------------------------------------
     5. Teachers carousel (prev / next, faded peek card)
  ------------------------------------------------------------ */
  const track = $('#tTrack');
  const cards = $$('.t-card', track);
  const VISIBLE = 4;
  const CARD_PITCH = 209 + 109;
  const maxIndex = Math.max(0, cards.length - VISIBLE);
  let tIndex = 0;

  const renderCarousel = () => {
    track.style.transform = `translateX(${-tIndex * CARD_PITCH}px)`;
    cards.forEach((c) => c.classList.remove('peek'));
    const peekIdx = tIndex + VISIBLE - 1;
    if (peekIdx < cards.length - 1) cards[peekIdx].classList.add('peek'); // faded "more ahead" card
  };
  $('#tNext').addEventListener('click', () => {
    tIndex = tIndex >= maxIndex ? 0 : tIndex + 1;      // wraps like the reference build
    renderCarousel();
  });
  $('#tPrev').addEventListener('click', () => {
    tIndex = tIndex <= 0 ? maxIndex : tIndex - 1;
    renderCarousel();
  });
  renderCarousel();

  // swipe support on touch devices
  let touchX = null;
  track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) (dx < 0 ? $('#tNext') : $('#tPrev')).click();
    touchX = null;
  }, { passive: true });

  /* ------------------------------------------------------------
     6. Bookmark toggles
  ------------------------------------------------------------ */
  $$('.bookmark').forEach((btn) => {
    btn.addEventListener('click', () => {
      const saved = btn.classList.toggle('saved');
      btn.setAttribute('aria-pressed', String(saved));
      btn.setAttribute('aria-label', saved ? 'Saved — remove from saved classes' : 'Save this class');
      showToast(saved ? 'Class saved to your list ♥' : 'Removed from your saved list');
    });
  });

  /* ------------------------------------------------------------
     7. Email forms (hero + CTA) with validation
  ------------------------------------------------------------ */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  $$('.mail-form').forEach((form) => {
    const input = $('.mail-input', form);
    const msg = $('.form-msg', form);
    const button = $('button[type="submit"]', form);
    const originalLabel = button.innerHTML;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return fail('Please enter your email address.');
      if (!EMAIL_RE.test(value)) return fail('That doesn’t look like a valid email — try again.');
      msg.textContent = 'Thanks! You’re on the list — happy exploring! 🎉';
      msg.className = 'form-msg ok';
      input.classList.remove('error');
      input.value = '';
      button.innerHTML = 'SENT ✓';
      button.disabled = true;
      showToast('Welcome to SimplePlan! 🎉');
      setTimeout(() => {
        button.innerHTML = originalLabel;
        button.disabled = false;
      }, 2600);
    });

    input.addEventListener('input', () => {
      input.classList.remove('error');
      msg.textContent = '';
      msg.className = 'form-msg';
    });

    function fail(text) {
      msg.textContent = text;
      msg.className = 'form-msg err';
      input.classList.add('error');
      input.focus();
    }
  });

  /* ------------------------------------------------------------
     8. Enroll buttons
  ------------------------------------------------------------ */
  let enrollCount = 0;
  $$('.enroll').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.textContent = 'Enrolled ✓';
      btn.disabled = true;
      enrollCount += 1;
      showToast(`Enrolled! ${enrollCount} class${enrollCount > 1 ? 'es' : ''} in your plan ✓`);
      setTimeout(() => { btn.textContent = 'Enroll now'; btn.disabled = false; }, 2400);
    });
  });

  /* ------------------------------------------------------------
     9. Floating chat widget
  ------------------------------------------------------------ */
  const chatWidget = $('#chatWidget');
  const chatBtn = $('#chatBtn');
  const chatPanel = $('#chatPanel');
  const chatBody = $('.chat-body', chatPanel);

  const closeChat = () => {
    chatWidget.classList.remove('open');
    chatBtn.setAttribute('aria-expanded', 'false');
    chatPanel.setAttribute('aria-hidden', 'true');
  };
  chatBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !chatWidget.classList.contains('open');
    chatWidget.classList.toggle('open', open);
    chatBtn.setAttribute('aria-expanded', String(open));
    chatPanel.setAttribute('aria-hidden', String(!open));
    if (open) $('#chatInput').focus();
  });
  $('#chatClose').addEventListener('click', closeChat);
  document.addEventListener('click', (e) => {
    if (chatWidget.classList.contains('open') && !e.target.closest('.chat-widget')) closeChat();
  });

  $('#chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('#chatInput');
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    setTimeout(() => addMsg('Thanks for reaching out! Our team will get back to you in a few minutes. 😊'), 700);
  });
  function addMsg(text, who = '') {
    const p = document.createElement('p');
    p.className = `chat-msg ${who}`.trim();
    p.textContent = text;
    chatBody.appendChild(p);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  /* ------------------------------------------------------------
     10. Back-to-top
  ------------------------------------------------------------ */
  const topBtn = $('#topBtn');
  window.addEventListener('scroll', () => {
    topBtn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ------------------------------------------------------------
     11. Reveal on load / scroll (staggered)
  ------------------------------------------------------------ */
  const revealEls = $$('.reveal');
  revealEls.forEach((el) => {
    const siblings = el.parentElement ? $$('.reveal', el.parentElement) : [];
    const idx = Math.max(0, siblings.indexOf(el));
    el.style.transitionDelay = `${Math.min(idx * 90, 360)}ms`;
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in-view'));
  }

  /* ------------------------------------------------------------
     12. Toast helper
  ------------------------------------------------------------ */
  let toastTimer;
  function showToast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
})();
