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

  // ================= 4. SEMI-HIDDEN BOTTOM DOCK CONTROLLER =================
  function initBottomDock() {
    var dock = document.getElementById('air-bottom-dock');
    var topBtn = document.getElementById('dock-btn-top');
    var brandBtn = dock ? dock.querySelector('.dock-brand') : null;
    if (!dock) return;

    var ticking = false;

    function checkDockVisibility() {
      var scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      var windowHeight = window.innerHeight;
      var docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );

      // Distance to page bottom
      var distanceToBottom = docHeight - (scrollY + windowHeight);

      // Only appear when scrolled down near the very bottom (within 160px of page bottom) and scrolled down
      if (distanceToBottom <= 160 && scrollY > 60) {
        dock.classList.add('is-visible');
      } else {
        dock.classList.remove('is-visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(checkDockVisibility);
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', checkDockVisibility, { passive: true });
    checkDockVisibility();

    if (topBtn) {
      topBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (brandBtn) {
      brandBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ================= INITIALIZE ON LOAD =================
  function init() {
    initTabs();
    initSearch();
    initContactModal();
    initBottomDock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
