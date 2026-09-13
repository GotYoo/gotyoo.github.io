/**
 * GotYoo · Modern Portfolio & Engineering Workbench System
 * Zero-dependency, lightweight, high-performance vanilla JS
 */

(function () {
  'use strict';

  // State
  let activeTerminalInterval = null;

  /* ==========================================================================
     1. THEME MANAGEMENT (Dark Obsidian / Light Studio)
     ========================================================================== */
  const THEME_KEY = 'gotyoo_theme_pref';

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark'); // default dark

    applyTheme(initialTheme);

    const themeToggleBtns = document.querySelectorAll('[data-theme-toggle]');
    themeToggleBtns.forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });

    // Listen to system changes if no explicit user preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggleBtns = document.querySelectorAll('[data-theme-toggle]');
    themeToggleBtns.forEach((btn) => {
      btn.setAttribute('aria-label', theme === 'dark' ? '切换为明亮模式' : '切换为暗色模式');
      btn.innerHTML = theme === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    });
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
    showToast(nextTheme === 'dark' ? '已切换为暗黑极客模式' : '已切换为明亮工作室模式');
  }

  /* ==========================================================================
     2. TOAST NOTIFICATION SYSTEM
     ========================================================================== */
  let toastTimer = null;

  function showToast(message) {
    let toast = document.getElementById('globalToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'globalToast';
      toast.className = 'toast-feedback';
      toast.innerHTML = '<span class="toast-icon">✓</span> <span class="toast-msg"></span>';
      document.body.appendChild(toast);
    }

    const msgEl = toast.querySelector('.toast-msg');
    if (msgEl) msgEl.textContent = message;

    toast.classList.add('is-visible');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  /* ==========================================================================
     3. INSTANT EMAIL COPY WITH TACTILE FEEDBACK
     ========================================================================== */
  function initEmailCopy() {
    const copyTriggers = document.querySelectorAll('[data-copy-email]');
    copyTriggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const email = btn.getAttribute('data-copy-email') || '654601458@qq.com';
        copyText(email, '已复制邮箱：' + email);
      });
    });
  }

  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg || '已复制到剪贴板 ✓');
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast(successMsg || '已复制到剪贴板 ✓');
    } catch (err) {
      prompt('请手动复制：', text);
    }
    document.body.removeChild(tempInput);
  }

  /* ==========================================================================
     4. HERO WORKBENCH SIMULATION (MiniCodeAgent Live Trace)
     ========================================================================== */
  const SIMULATED_STEPS = [
    { tag: 'SYS', tagClass: 'term-tag--sys', text: 'Initializing MiniCodeAgent harness (v0.4.2)...' },
    { tag: 'AST', tagClass: 'term-tag--ast', text: 'Ingesting repository AST context (62 files, 14.8k LOC)...' },
    { tag: 'MEM', tagClass: 'term-tag--mem', text: 'Retrieving Layered Memory: L1 Working (active) + L2 Epistemic (indexed)...' },
    { tag: 'EXEC', tagClass: 'term-tag--exec', text: 'Synthesizing patch: context compressed 68%, isolated in Docker sandbox...' },
    { tag: 'CHECK', tagClass: 'term-tag--ok', text: 'Regression test passed: SWE-bench test_parser.py (14 passed in 0.42s) ✓' },
    { tag: 'STATE', tagClass: 'term-tag--ok', text: 'State checkpoint committed: zero drift, patch ready for review.', highlight: true }
  ];

  function initHeroConsole() {
    const consoleCard = document.getElementById('heroConsole');
    if (!consoleCard) return;

    const tabBtns = consoleCard.querySelectorAll('.console-tab-btn');
    const tabPanes = consoleCard.querySelectorAll('[data-console-pane]');
    const rerunBtn = document.getElementById('rerunSimBtn');

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        tabPanes.forEach((pane) => {
          pane.style.display = pane.getAttribute('data-console-pane') === targetTab ? 'block' : 'none';
        });

        if (targetTab === 'stream') {
          runTerminalStream();
        }
      });
    });

    if (rerunBtn) {
      rerunBtn.addEventListener('click', () => {
        runTerminalStream(true);
      });
    }

    runTerminalStream();
  }

  function runTerminalStream(force = false) {
    const streamContainer = document.getElementById('terminalStream');
    if (!streamContainer) return;

    if (activeTerminalInterval) {
      clearInterval(activeTerminalInterval);
      activeTerminalInterval = null;
    }

    streamContainer.innerHTML = '';
    let stepIndex = 0;

    function renderNextStep() {
      if (stepIndex >= SIMULATED_STEPS.length) {
        if (activeTerminalInterval) {
          clearInterval(activeTerminalInterval);
          activeTerminalInterval = null;
        }
        return;
      }

      const step = SIMULATED_STEPS[stepIndex];
      const lineEl = document.createElement('div');
      lineEl.className = 'term-line';
      lineEl.innerHTML = `
        <span class="term-tag ${step.tagClass}">[${step.tag}]</span>
        <span class="term-text ${step.highlight ? 'term-text--success' : ''}">${step.text}</span>
      `;
      streamContainer.appendChild(lineEl);
      stepIndex++;
    }

    renderNextStep();
    activeTerminalInterval = setInterval(renderNextStep, 700);
  }

  /* ==========================================================================
     5. PROJECT CATEGORY FILTERING
     ========================================================================== */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('[data-filter]');
    const projectCards = document.querySelectorAll('[data-project-category]');
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-filter');
        filterBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        projectCards.forEach((card) => {
          const cardCat = card.getAttribute('data-project-category') || '';
          if (category === 'all' || cardCat.includes(category)) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ==========================================================================
     6. PHOTOGRAPHY LIGHTBOX VIEWER
     ========================================================================== */
  const galleryItems = [
    {
      src: '/images/pic01.jpg',
      title: '湖面把秋天留了一会儿',
      desc: '安静的自然倒影与树林清晨薄雾，湖光静止的清澈片刻。',
      meta: 'AUTUMN LAKE · NATURAL LIGHT'
    },
    {
      src: '/images/bg.jpg',
      title: '向水面更深处出发',
      desc: '开阔水域与日光映射下的前行片刻，湛蓝波纹与远方地平线。',
      meta: 'INTO THE BLUE · WIDE WATER'
    },
    {
      src: '/images/pic02.jpg',
      title: '把日常换一种光线',
      desc: '旷野、公路与拿起相机的瞬间，阳光在风里留下清晰的轮廓。',
      meta: 'ON THE ROAD · GOLDEN DRIFT'
    }
  ];

  let currentPhotoIdx = 0;

  function initLightbox() {
    const photoCards = document.querySelectorAll('[data-photo-index]');
    const lightbox = document.getElementById('photoLightbox');
    if (!lightbox) return;

    const imgEl = lightbox.querySelector('[data-lightbox-img]');
    const titleEl = lightbox.querySelector('[data-lightbox-title]');
    const descEl = lightbox.querySelector('[data-lightbox-desc]');
    const tagEl = lightbox.querySelector('[data-lightbox-tag]');
    const closeBtn = lightbox.querySelector('[data-lightbox-close]');

    photoCards.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-photo-index'), 10) || 0;
        openPhoto(idx);
      });
    });

    function openPhoto(index) {
      if (index < 0 || index >= galleryItems.length) return;
      currentPhotoIdx = index;
      const item = galleryItems[index];

      if (imgEl) imgEl.src = item.src;
      if (titleEl) titleEl.textContent = item.title;
      if (descEl) descEl.textContent = item.desc;
      if (tagEl) tagEl.textContent = item.meta;

      lightbox.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function closePhoto() {
      lightbox.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closePhoto);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-image-container')) {
        closePhoto();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-active')) return;
      if (e.key === 'Escape') closePhoto();
      if (e.key === 'ArrowRight') openPhoto((currentPhotoIdx + 1) % galleryItems.length);
      if (e.key === 'ArrowLeft') openPhoto((currentPhotoIdx - 1 + galleryItems.length) % galleryItems.length);
    });
  }

  /* ==========================================================================
     7. COMMAND PALETTE (CMD+K / CTRL+K)
     ========================================================================== */
  function initCommandPalette() {
    const palette = document.getElementById('cmdPalette');
    const openBtns = document.querySelectorAll('[data-open-cmd]');
    const input = document.getElementById('cmdInput');
    const items = document.querySelectorAll('.cmd-item');
    if (!palette) return;

    function openPalette() {
      palette.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      if (input) {
        input.value = '';
        input.focus();
      }
      filterCmdItems('');
    }

    function closePalette() {
      palette.classList.remove('is-active');
      document.body.style.overflow = '';
    }

    openBtns.forEach((b) => b.addEventListener('click', openPalette));

    palette.addEventListener('click', (e) => {
      if (e.target === palette) closePalette();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (palette.classList.contains('is-active')) {
          closePalette();
        } else {
          openPalette();
        }
      }
      if (e.key === 'Escape' && palette.classList.contains('is-active')) {
        closePalette();
      }
    });

    if (input) {
      input.addEventListener('input', (e) => {
        filterCmdItems(e.target.value.toLowerCase().trim());
      });
    }

    function filterCmdItems(query) {
      items.forEach((item) => {
        const text = item.textContent.toLowerCase();
        item.style.display = !query || text.includes(query) ? 'flex' : 'none';
      });
    }

    items.forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        closePalette();
        executeAction(action);
      });
    });

    function executeAction(action) {
      if (!action) return;
      if (action.startsWith('#') || action.startsWith('/')) {
        window.location.href = action;
      } else if (action === 'copy-email') {
        copyText('654601458@qq.com', '已复制邮箱：654601458@qq.com');
      } else if (action === 'toggle-theme') {
        toggleTheme();
      } else if (action === 'github') {
        window.open('https://github.com/GotYoo', '_blank');
      }
    }
  }

  /* ==========================================================================
     8. ACTIVE NAVIGATION SPY
     ========================================================================== */
  function initNavObserver() {
    const navLinks = document.querySelectorAll('.site-nav__link');
    const sections = document.querySelectorAll('section[id]');
    if (!navLinks.length || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === '#' + id || href === '/' + id) {
              link.classList.add('is-active');
            } else if (href && href.startsWith('#')) {
              link.classList.remove('is-active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px'
    });

    sections.forEach((sec) => observer.observe(sec));
  }

  /* ==========================================================================
     INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEmailCopy();
    initHeroConsole();
    initProjectFilters();
    initLightbox();
    initCommandPalette();
    initNavObserver();
  });

})();
