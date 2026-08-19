
document.addEventListener('DOMContentLoaded', function () {

  /* Countdown — homepage only */
  const countdown = document.getElementById('countdown');
  if (countdown) {
    const targetDate = new Date(countdown.dataset.date).getTime();

    function updateCountdown() {
      const now = Date.now();
      const distance = targetDate - now;

      const daysEl = document.getElementById('days');
      const hoursEl = document.getElementById('hours');
      const minutesEl = document.getElementById('minutes');
      const secondsEl = document.getElementById('seconds');

      if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

      if (distance <= 0) {
        daysEl.textContent = '000';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const d = Math.floor(distance / 86400000);
      const h = Math.floor((distance % 86400000) / 3600000);
      const m = Math.floor((distance % 3600000) / 60000);
      const s = Math.floor((distance % 60000) / 1000);

      daysEl.textContent = String(d).padStart(3, '0');
      hoursEl.textContent = String(h).padStart(2, '0');
      minutesEl.textContent = String(m).padStart(2, '0');
      secondsEl.textContent = String(s).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* Mobile navigation — all pages */
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      menuToggle.setAttribute(
        'aria-expanded',
        nav.classList.contains('open') ? 'true' : 'false'
      );
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Reveal animation — only if supported */
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* RSVP — RSVP pages only */
  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const formData = Object.fromEntries(new FormData(rsvpForm).entries());
      const submissions = JSON.parse(
        localStorage.getItem('weddingRSVPs') || '[]'
      );

      submissions.push({
        ...formData,
        submittedAt: new Date().toISOString()
      });

      localStorage.setItem('weddingRSVPs', JSON.stringify(submissions));

      const message = document.getElementById('formMessage');
      if (message) {
        message.textContent =
          'Thank you! Your RSVP has been saved on this device. Connect the form to your email or database before publishing for live guest submissions.';
      }

      rsvpForm.reset();
    });
  }

  /* Registry filtering + expandable items — registry page only */
  const registryGrid = document.querySelector('.registry-items-grid');

  if (registryGrid) {
    const cards = Array.from(
      registryGrid.querySelectorAll('.gift-card')
    );
    const filterButtons = Array.from(
      document.querySelectorAll('.registry-filter')
    );
    const loadMoreButton = document.getElementById('registryLoadMore');

    let showExtraItems = false;
    let activeFilter = 'all';

    function cardMatchesFilter(card) {
      if (activeFilter === 'all') return true;

      if (activeFilter === 'available') {
        return card.dataset.status === 'available';
      }

      return card.dataset.store === activeFilter;
    }

    function updateRegistry() {
      cards.forEach(function (card) {
        const isExtra = card.classList.contains('registry-extra');
        const expansionAllowsCard = !isExtra || showExtraItems;
        const filterAllowsCard = cardMatchesFilter(card);
        const shouldShow = expansionAllowsCard && filterAllowsCard;

        card.hidden = !shouldShow;
        card.style.display = shouldShow ? '' : 'none';
      });

      if (loadMoreButton) {
        loadMoreButton.textContent = showExtraItems
          ? 'Show Fewer Registry Items'
          : 'Browse More Registry Items';

        loadMoreButton.setAttribute(
          'aria-expanded',
          showExtraItems ? 'true' : 'false'
        );
      }
    }

    filterButtons.forEach(function (button) {
      button.setAttribute(
        'aria-pressed',
        button.classList.contains('active') ? 'true' : 'false'
      );

      button.addEventListener('click', function () {
        activeFilter = button.dataset.filter || 'all';

        filterButtons.forEach(function (btn) {
          const isActive = btn === button;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        /* Category filters browse the complete matching registry. */
        if (activeFilter !== 'all') {
          showExtraItems = true;
        }

        updateRegistry();
      });
    });

    if (loadMoreButton) {
      loadMoreButton.setAttribute('aria-expanded', 'false');

      loadMoreButton.addEventListener('click', function () {
        showExtraItems = !showExtraItems;

        /* Returning to collapsed mode keeps All selected so exactly
           the original six cards are shown again. */
        if (!showExtraItems && activeFilter !== 'all') {
          activeFilter = 'all';
          filterButtons.forEach(function (btn) {
            const isAll = btn.dataset.filter === 'all';
            btn.classList.toggle('active', isAll);
            btn.setAttribute('aria-pressed', isAll ? 'true' : 'false');
          });
        }

        updateRegistry();
      });
    }

    updateRegistry();
  }
});


/* Journal View More */
document.addEventListener('DOMContentLoaded', function () {
  const button = document.getElementById('journalLoadMore');
  if (!button) return;

  const extraPosts = Array.from(document.querySelectorAll('.journal-extra'));
  let expanded = false;

  function renderJournal() {
    extraPosts.forEach(function (post) {
      post.hidden = !expanded;
      post.style.display = expanded ? '' : 'none';
    });

    button.textContent = expanded ? 'Show Fewer Journals' : 'View More Journals';
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }

  button.addEventListener('click', function () {
    expanded = !expanded;
    renderJournal();
  });

  renderJournal();
});






/* Stonewall Farms expandable map */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.stonewall-map-toggle').forEach(function (toggle) {
    toggle.addEventListener('click', function (event) {
      event.preventDefault();

      const card = toggle.closest('.detail-card') || toggle.parentElement;
      const panel = card ? card.querySelector('.stonewall-map-panel') : null;
      if (!panel) return;

      const isOpening = panel.hasAttribute('hidden');

      document.querySelectorAll('.stonewall-map-panel').forEach(function (other) {
        other.setAttribute('hidden', '');
      });

      if (isOpening) {
        panel.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        panel.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  document.querySelectorAll('.stonewall-map-close').forEach(function (button) {
    button.addEventListener('click', function () {
      const panel = button.closest('.stonewall-map-panel');
      if (!panel) return;
      panel.setAttribute('hidden', '');

      const card = panel.closest('.detail-card');
      const toggle = card ? card.querySelector('.stonewall-map-toggle') : null;
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  });
});
