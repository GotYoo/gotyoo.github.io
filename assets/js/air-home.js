(function () {
  'use strict';

  // ================= 1. TAB CONTROLLER =================
  var tabs = ['projects', 'writing', 'pedigree'];

  function switchTab(targetId) {
    tabs.forEach(function (tab) {
      // Panes
      var pane = document.getElementById('pane-' + tab);
      if (pane) {
        if (tab === targetId) {
          pane.classList.remove('is-hidden');
        } else {
          pane.classList.add('is-hidden');
        }
      }

      // Sidebar buttons
      var navBtn = document.getElementById('nav-tab-' + tab);
      if (navBtn) {
        if (tab === targetId) {
          navBtn.classList.add('is-active');
        } else {
          navBtn.classList.remove('is-active');
        }
      }

      // Footer buttons
      var footerBtn = document.getElementById('btn-tab-' + tab);
      if (footerBtn) {
        if (tab === targetId) {
          footerBtn.classList.add('is-active');
        } else {
          footerBtn.classList.remove('is-active');
        }
      }
    });
  }

  // Expose globally
  window.switchAirTab = switchTab;

  function initTabs() {
    tabs.forEach(function (tab) {
      var navBtn = document.getElementById('nav-tab-' + tab);
      if (navBtn) {
        navBtn.addEventListener('click', function () {
          switchTab(tab);
        });
      }

      var footerBtn = document.getElementById('btn-tab-' + tab);
      if (footerBtn) {
        footerBtn.addEventListener('click', function () {
          switchTab(tab);
        });
      }
    });
  }

  // ================= 2. SEARCH ENGINE & DROPDOWN =================
  function initSearch() {
    var searchInput = document.getElementById('workspace-search-input');
    var clearBtn = document.getElementById('workspace-search-clear');
    var dropdown = document.getElementById('workspace-search-dropdown');
    var searchDataEl = document.getElementById('search-data');

    if (!searchInput || !dropdown) return;

    var database = [];
    if (searchDataEl) {
      try {
        database = JSON.parse(searchDataEl.textContent || '[]');
      } catch (e) {
        console.error('Failed to parse search database:', e);
      }
    }

    var selectedIndex = -1;
    var currentMatches = [];

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function escapeRegExp(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function highlightText(text, query) {
      if (!query || !text) return escapeHtml(text);
      var safeQuery = escapeRegExp(query.trim());
      if (!safeQuery) return escapeHtml(text);
      try {
        var regex = new RegExp('(' + safeQuery + ')', 'gi');
        return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
      } catch (e) {
        return escapeHtml(text);
      }
    }

    function closeDropdown() {
      dropdown.classList.add('is-hidden');
      dropdown.innerHTML = '';
      selectedIndex = -1;
      currentMatches = [];
    }

    function filterInTabCards(query) {
      var activePane = document.querySelector('.tab-pane:not(.is-hidden)');
      if (!activePane) return;

      var cards = activePane.querySelectorAll('.project-card, .article-row, .pedigree-card');
      if (!query) {
        cards.forEach(function (card) {
          card.classList.remove('is-search-hidden');
        });
        return;
      }

      var q = query.toLowerCase();
      cards.forEach(function (card) {
        var text = (card.textContent || '').toLowerCase();
        if (text.indexOf(q) !== -1) {
          card.classList.remove('is-search-hidden');
        } else {
          card.classList.add('is-search-hidden');
        }
      });
    }

    function performSearch(query) {
      var q = (query || '').trim().toLowerCase();

      // In-tab live filtering
      filterInTabCards(q);

      if (!q) {
        if (clearBtn) clearBtn.style.display = 'none';
        closeDropdown();
        return;
      }

      if (clearBtn) clearBtn.style.display = 'flex';

      // Match items in database
      currentMatches = database.filter(function (item) {
        var inTitle = (item.title || '').toLowerCase().indexOf(q) !== -1;
        var inSubtitle = (item.subtitle || '').toLowerCase().indexOf(q) !== -1;
        var inDesc = (item.description || '').toLowerCase().indexOf(q) !== -1;
        var inTags = Array.isArray(item.tags) && item.tags.some(function (t) {
          return t.toLowerCase().indexOf(q) !== -1;
        });
        var inCategory = (item.categoryLabel || '').toLowerCase().indexOf(q) !== -1;
        return inTitle || inSubtitle || inDesc || inTags || inCategory;
      });

      renderDropdown(q);
    }

    function renderDropdown(query) {
      selectedIndex = -1;
      if (currentMatches.length === 0) {
        dropdown.innerHTML =
          '<div class="search-empty">' +
          '未匹配到 <b>"' + escapeHtml(query) + '"</b> 相关的项目或手记<br>' +
          '<span style="color:#94a3b8; font-size:11px;">可尝试搜索：Agent、RAG、沙箱、手记、杭电、简历</span>' +
          '</div>';
        dropdown.classList.remove('is-hidden');
        return;
      }

      // Group items by category
      var groups = {
        projects: { title: '⚡ 精选项目 (PROJECTS)', items: [] },
        writing: { title: '✎ 深度手记 (WRITING)', items: [] },
        pedigree: { title: '🎓 学术履历 (PEDIGREE)', items: [] },
        pages: { title: '📄 站点页面 (PAGES)', items: [] }
      };

      currentMatches.forEach(function (item, index) {
        var cat = item.category || 'pages';
        if (!groups[cat]) {
          groups[cat] = { title: item.categoryLabel || '相关内容', items: [] };
        }
        item._globalIndex = index;
        groups[cat].items.push(item);
      });

      var html = '';
      Object.keys(groups).forEach(function (key) {
        var group = groups[key];
        if (group.items.length === 0) return;

        html += '<div class="search-group">';
        html += '<div class="search-group-title">' + group.title + '</div>';

        group.items.forEach(function (item) {
          var badgeText = item.actionType === 'tab' ? '工作台直达' : (item.target === '_blank' ? 'GitHub ↗' : '页面 ↗');
          html += '<div class="search-item" data-index="' + item._globalIndex + '" role="option">';
          html += '  <div class="search-item-top">';
          html += '    <span class="search-item-title">' + highlightText(item.title, query) + '</span>';
          html += '    <span class="search-item-badge">' + badgeText + '</span>';
          html += '  </div>';
          if (item.description) {
            html += '  <div class="search-item-desc">' + highlightText(item.description, query) + '</div>';
          }
          html += '</div>';
        });

        html += '</div>';
      });

      dropdown.innerHTML = html;
      dropdown.classList.remove('is-hidden');
    }

    function selectItem(index) {
      var itemEls = dropdown.querySelectorAll('.search-item');
      itemEls.forEach(function (el) {
        el.classList.remove('is-selected');
      });

      if (index >= 0 && index < itemEls.length) {
        selectedIndex = index;
        var currentEl = itemEls[selectedIndex];
        currentEl.classList.add('is-selected');
        currentEl.scrollIntoView({ block: 'nearest' });
      }
    }

    function executeItemAction(item) {
      if (!item) return;

      if (item.actionType === 'tab' && item.tab) {
        switchTab(item.tab);
        closeDropdown();

        // Scroll to workspace and flash focus
        var ws = document.getElementById('workspace');
        if (ws) {
          ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Pulse highlight active pane
        var pane = document.getElementById('pane-' + item.tab);
        if (pane) {
          pane.classList.remove('card-search-highlight');
          void pane.offsetWidth;
          pane.classList.add('card-search-highlight');
        }
      } else if (item.url) {
        closeDropdown();
        if (item.target === '_blank') {
          window.open(item.url, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = item.url;
        }
      }
    }

    // Input events
    searchInput.addEventListener('input', function (e) {
      performSearch(e.target.value);
    });

    searchInput.addEventListener('focus', function () {
      if (searchInput.value.trim()) {
        performSearch(searchInput.value);
      }
    });

    // Clear button
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        searchInput.focus();
        performSearch('');
      });
    }

    // Keyboard navigation
    searchInput.addEventListener('keydown', function (e) {
      var itemEls = dropdown.querySelectorAll('.search-item');
      if (dropdown.classList.contains('is-hidden') || itemEls.length === 0) {
        if (e.key === 'Escape') {
          searchInput.blur();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        var next = selectedIndex + 1;
        if (next >= itemEls.length) next = 0;
        selectItem(next);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        var prev = selectedIndex - 1;
        if (prev < 0) prev = itemEls.length - 1;
        selectItem(prev);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
        var chosenEl = itemEls[targetIndex];
        if (chosenEl) {
          var realIndex = parseInt(chosenEl.getAttribute('data-index'), 10);
          executeItemAction(currentMatches[realIndex]);
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
        searchInput.blur();
      }
    });

    // Click on search item delegation
    dropdown.addEventListener('click', function (e) {
      var itemEl = e.target.closest('.search-item');
      if (itemEl) {
        var realIndex = parseInt(itemEl.getAttribute('data-index'), 10);
        executeItemAction(currentMatches[realIndex]);
      }
    });

    // Click outside to close dropdown
    document.addEventListener('click', function (e) {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target) && (clearBtn ? !clearBtn.contains(e.target) : true)) {
        closeDropdown();
      }
    });

    // Global shortcut '/' to focus search
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== searchInput) {
        var tag = (document.activeElement.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          var ws = document.getElementById('workspace');
          if (ws) ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
          searchInput.focus();
        }
      }
    });
  }

  // ================= 3. EMAIL CONTACT & COPIED MODAL =================
  function initContactModal() {
    var modal = document.getElementById('air-contact-modal');
    var closeBtn = document.getElementById('air-modal-close-btn');
    var copyAgainBtn = document.getElementById('modal-copy-again-btn');
    var emailTextEl = document.getElementById('modal-email-text');
    var toast = document.getElementById('air-toast');
    var toastMsg = document.getElementById('air-toast-message');
    var toastTimer = null;

    var defaultEmail = '654601458@qq.com';
    if (emailTextEl && emailTextEl.textContent.trim()) {
      defaultEmail = emailTextEl.textContent.trim();
    }

    function showToast(message) {
      if (!toast) return;
      if (toastMsg) toastMsg.textContent = message;
      toast.classList.add('is-active');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove('is-active');
      }, 3000);
    }

    function openModal() {
      if (modal) {
        modal.classList.add('is-active');
        modal.setAttribute('aria-hidden', 'false');
      }
    }

    function closeModal() {
      if (modal) {
        modal.classList.remove('is-active');
        modal.setAttribute('aria-hidden', 'true');
      }
    }

    function copyToClipboard(text, onSuccess) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          if (onSuccess) onSuccess();
        }).catch(function () {
          fallbackCopy(text, onSuccess);
        });
      } else {
        fallbackCopy(text, onSuccess);
      }
    }

    function fallbackCopy(text, onSuccess) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var successful = document.execCommand('copy');
        document.body.removeChild(ta);
        if (successful && onSuccess) onSuccess();
      } catch (err) {
        console.error('Fallback copy error:', err);
      }
    }

    // Attach to all contact buttons and mailto links
    var contactTriggers = document.querySelectorAll('[data-contact-btn], a[href^="mailto:"]');
    contactTriggers.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();

        var email = btn.getAttribute('data-email') || defaultEmail;

        // Execute instant copy
        copyToClipboard(email, function () {
          // Visual feedback on button
          var originalContent = btn.innerHTML;
          btn.classList.add('is-copied');

          // If button has simple text, give quick text confirmation
          var hasLongText = originalContent.length > 25;
          if (btn.classList.contains('dock-btn-contact')) {
            btn.innerHTML = '已复制 ✓';
          } else if (!hasLongText) {
            btn.innerHTML = '已复制 ' + email + ' ✓';
          }

          setTimeout(function () {
            btn.classList.remove('is-copied');
            btn.innerHTML = originalContent;
          }, 2400);

          // Show Toast and Open Air Modal
          showToast('已复制邮箱：' + email);
          openModal();
        });
      });
    });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    // Modal background click
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          closeModal();
        }
      });
    }

    // Copy again button inside modal
    if (copyAgainBtn && emailTextEl) {
      copyAgainBtn.addEventListener('click', function () {
        var email = emailTextEl.textContent.trim();
        copyToClipboard(email, function () {
          copyAgainBtn.textContent = '已复制 ✓';
          copyAgainBtn.style.background = '#059669';
          copyAgainBtn.style.borderColor = '#059669';
          copyAgainBtn.style.color = '#ffffff';
          showToast('已复制邮箱：' + email);
          setTimeout(function () {
            copyAgainBtn.textContent = '再次复制';
            copyAgainBtn.style.background = '';
            copyAgainBtn.style.borderColor = '';
            copyAgainBtn.style.color = '';
          }, 2000);
        });
      });
    }

    // Escape key to close modal
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
        closeModal();
      }
    });
  }

  // ================= 4. PROGRESSIVE AIR MORPHING HEADER =================
  function initMorphHeader() {
    var header = document.querySelector('[data-header]');
    if (!header) return;

    var ticking = false;

    function updateHeader() {
      var scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });

    updateHeader();
  }

  // ================= 5. CLOUD ENTRANCE LIFECYCLE (Click to Part) =================
  function initCloudEntrance() {
    var entrance = document.getElementById('cloud-entrance');
    var siteWrap = document.querySelector('.site-wrap');
    if (!entrance) {
      if (siteWrap) siteWrap.classList.add('is-revealed');
      return;
    }

    // Respect reduced motion preference
    var mediaQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery && mediaQuery.matches) {
      entrance.classList.add('is-ended');
      entrance.style.display = 'none';
      if (siteWrap) siteWrap.classList.add('is-revealed');
      return;
    }

    var isParted = false;

    function partClouds() {
      if (isParted) return;
      isParted = true;
      entrance.classList.add('is-parting');
      if (siteWrap) {
        siteWrap.classList.add('is-revealed');
      }

      // Cleanup GPU composite layers after animation completes (1.45s)
      setTimeout(function () {
        entrance.classList.add('is-ended');
        entrance.style.display = 'none';
      }, 1450);
    }

    // Trigger on user click, tap, or keyboard Enter/Space
    entrance.addEventListener('click', partClouds);
    entrance.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        partClouds();
      }
    });

    // Expose replay function globally in case needed
    window.replayCloudEntrance = function () {
      isParted = false;
      entrance.style.display = 'block';
      entrance.classList.remove('is-ended', 'is-parting');
      if (siteWrap) siteWrap.classList.remove('is-revealed');
      void entrance.offsetWidth; // force reflow
    };
  }

  // ================= 6. 4-STATE TIME SWITCHER (🌄 ☀️ 🌅 🌙) =================
  function initTimeSwitcher() {
    var body = document.body;
    var slider = document.getElementById('timeDockSlider');
    var badge = document.getElementById('dockActiveBadge');

    var modes = [
      { id: 'btn-sky-dawn', theme: 'theme-dawn', slot: 0 },
      { id: 'btn-sky-day', theme: 'theme-day', slot: 1 },
      { id: 'btn-sky-sunset', theme: 'theme-sunset', slot: 2 },
      { id: 'btn-sky-night', theme: 'theme-night', slot: 3 }
    ];

    var allBtns = [];
    modes.forEach(function (m) {
      m.el = document.getElementById(m.id);
      if (m.el) allBtns.push(m);
    });

    if (allBtns.length === 0) return;

    function setSkyTheme(themeClass) {
      body.classList.remove('theme-dawn', 'theme-day', 'theme-sunset', 'theme-night');
      body.classList.add(themeClass);

      var activeMode = null;
      modes.forEach(function (m) {
        if (!m.el) return;
        if (m.theme === themeClass) {
          m.el.classList.add('is-active');
          activeMode = m;
        } else {
          m.el.classList.remove('is-active');
        }
      });

      if (activeMode) {
        var offsetPx = activeMode.slot * 44;
        if (slider) {
          slider.style.transform = 'translateY(' + offsetPx + 'px)';
        }
        if (badge) {
          badge.style.transform = 'translateY(' + offsetPx + 'px)';
        }
      }

      try {
        localStorage.setItem('gotyoo-sky-theme', themeClass);
      } catch (e) {}
    }

    modes.forEach(function (m) {
      if (m.el) {
        m.el.addEventListener('click', function () {
          setSkyTheme(m.theme);
        });
      }
    });

    // Restore saved or daytime default
    var saved = 'theme-day';
    try {
      saved = localStorage.getItem('gotyoo-sky-theme') || 'theme-day';
    } catch (e) {}
    setSkyTheme(saved);
  }

  // ================= 7. 3-CARD INTERACTIVE SHOWCASE (Projects · Writing · Life) =================
  function initAirCards() {
    var cards = document.querySelectorAll('.air-card-item');
    var promptCapsule = document.getElementById('heroPromptCapsule');
    var promptTextEl = document.getElementById('promptText');
    var promptCursorEl = document.getElementById('promptCursor');
    if (!cards || cards.length === 0 || !promptTextEl || !promptCapsule) return;

    var currentText = '';
    var targetText = '';
    var typingTimer = null;
    var cursorTimer = null;
    var isErasing = false;

    // Ensure capsule width is purely determined by content (never locked to a rigid inline width)
    promptCapsule.style.width = '';

    function stopTimers() {
      if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
      }
      if (cursorTimer) {
        clearTimeout(cursorTimer);
        cursorTimer = null;
      }
    }

    function showCursor() {
      if (promptCursorEl) {
        promptCursorEl.classList.remove('is-hidden');
      }
    }

    function hideCursorWithDelay(delay) {
      if (cursorTimer) clearTimeout(cursorTimer);
      cursorTimer = setTimeout(function () {
        if (promptCursorEl && !typingTimer) {
          promptCursorEl.classList.add('is-hidden');
        }
      }, delay || 750);
    }

    function typeToTarget() {
      stopTimers();
      showCursor();

      function step() {
        if (currentText === targetText) {
          isErasing = false;
          hideCursorWithDelay(850);
          return;
        }

        // If currentText is not a prefix of targetText, smoothly erase
        var isPrefix = (targetText.indexOf(currentText) === 0);

        if (!isPrefix && currentText.length > 0) {
          isErasing = true;
          // Delete 2 characters at a time for a smooth contraction (~180-220ms total)
          var stepBack = Math.min(2, currentText.length);
          currentText = currentText.slice(0, currentText.length - stepBack);
          promptTextEl.textContent = currentText;
          // The capsule width contracts in real time as characters disappear
          typingTimer = setTimeout(step, 10);
          return;
        }

        // If we just finished erasing, take a brief 60ms breath before typing new text
        if (isErasing) {
          isErasing = false;
          typingTimer = setTimeout(step, 60);
          return;
        }

        // Type forward one character at a time — capsule visibly lengthens with every typed character!
        var nextLen = currentText.length + 1;
        currentText = targetText.slice(0, nextLen);
        promptTextEl.textContent = currentText;

        var charJustTyped = currentText.charAt(currentText.length - 1);
        var delay = (charJustTyped === ' ' || charJustTyped === ',') ? 18 : 25;
        typingTimer = setTimeout(step, delay);
      }

      step();
    }

    function setPromptText(newPrompt) {
      if (newPrompt === targetText && !isErasing && currentText === targetText) {
        return;
      }
      targetText = newPrompt || '';
      typeToTarget();
    }

    function activateCard(card, triggerTyping) {
      if (!card) return;
      cards.forEach(function (c) {
        c.classList.remove('is-active');
      });
      card.classList.add('is-active');

      var prompt = card.getAttribute('data-prompt') || '';
      var url = card.getAttribute('data-url') || '';
      var title = card.querySelector('.air-card-title');
      var titleText = title ? title.textContent.trim() : 'Page';

      if (promptCapsule) {
        promptCapsule.setAttribute('title', 'Explore ' + titleText + ' ↗');
        if (url) {
          promptCapsule.setAttribute('data-target-url', url);
        }
      }

      if (triggerTyping) {
        setPromptText(prompt);
      }
    }

    function navigateCard(card) {
      var url = card.getAttribute('data-url');
      if (url) {
        window.location.href = url;
      }
    }

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        activateCard(card, true);
      });

      card.addEventListener('click', function () {
        var wasActive = card.classList.contains('is-active');
        activateCard(card, true);
        if (wasActive || window.matchMedia('(hover: hover)').matches) {
          navigateCard(card);
        }
      });
    });

    if (promptCapsule) {
      promptCapsule.addEventListener('click', function () {
        var targetUrl = promptCapsule.getAttribute('data-target-url');
        if (!targetUrl) {
          var activeCard = document.querySelector('.air-card-item.is-active') || cards[0];
          targetUrl = activeCard ? activeCard.getAttribute('data-url') : '';
        }
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      });

      promptCapsule.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          promptCapsule.click();
        }
      });
    }

    // Initial activation on page load: start compact and smoothly expand with typewriter
    var defaultCard = document.querySelector('.air-card-item.is-active') || cards[0];
    if (defaultCard) {
      activateCard(defaultCard, false);
      var initialPrompt = defaultCard.getAttribute('data-prompt') || 'Explore production-grade AI agents and systems';
      currentText = '';
      promptTextEl.textContent = '';
      showCursor();
      // Begin typing after 280ms on page load so visitor clearly sees the capsule dynamically lengthening
      setTimeout(function () {
        setPromptText(initialPrompt);
      }, 280);
    }
  }

  // ================= 8. SCROLL-SCALING DYNAMIC AIR LOGO (Hero to Navbar Migration) =================
  function initScrollScalingLogo() {
    var logoWrap = document.getElementById('heroScrollLogoWrap');
    var headerCenterLogo = document.getElementById('headerCenterLogo');
    if (!logoWrap && !headerCenterLogo) return;

    var ticking = false;

    function updateLogoScale() {
      var scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

      // Hero logo shrinks & drifts up during initial scroll (0 -> 160px)
      var heroMaxScroll = 160;
      var heroProgress = Math.min(Math.max(scrollY / heroMaxScroll, 0), 1);
      var heroEase = heroProgress * (2 - heroProgress);

      if (logoWrap) {
        var scale = 1.0 - (heroEase * 0.58);
        var translateY = -heroEase * 38;
        var opacity = 1.0 - (heroEase * 0.92);
        logoWrap.style.transform = 'translate3d(0, ' + translateY + 'px, 0) scale(' + scale + ')';
        logoWrap.style.opacity = opacity;
      }

      // Navbar center logo fades in smoothly as hero logo disappears (30px -> 120px)
      if (headerCenterLogo) {
        var navProgress = Math.min(Math.max((scrollY - 30) / 90, 0), 1);
        var navEase = navProgress * (2 - navProgress);
        headerCenterLogo.style.opacity = navEase;
        headerCenterLogo.style.transform = 'translate(-50%, -50%) scale(' + (0.82 + navEase * 0.18) + ')';
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateLogoScale);
        ticking = true;
      }
    }, { passive: true });

    updateLogoScale();
  }

  // ================= INITIALIZE ON LOAD =================
  function init() {
    initTabs();
    initSearch();
    initContactModal();
    initMorphHeader();
    initCloudEntrance();
    initTimeSwitcher();
    initAirCards();
    initScrollScalingLogo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
