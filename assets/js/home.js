(function() {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;

  // Set active nav link
  var page = body.dataset.page;
  if (page) {
    var activeLink = doc.querySelector('.air-nav a[data-nav="' + page + '"]');
    if (activeLink) activeLink.classList.add('is-active');
  }

  // Header scroll glass effect
  var header = doc.querySelector('[data-header]');
  var readBar = doc.querySelector('[data-read-bar]');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || 0;
    if (header) {
      if (y > 24) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    // Article reading progress bar
    if (readBar) {
      var article = doc.querySelector('[data-article-content]');
      if (article) {
        var rect = article.getBoundingClientRect();
        var total = article.offsetHeight - window.innerHeight;
        var passed = Math.min(total, Math.max(0, -rect.top + 100));
        var pct = total > 0 ? Math.min(100, Math.max(0, (passed / total) * 100)) : 0;
        readBar.style.width = pct + '%';
      }
    }
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  // Footer Year
  var yearEls = doc.querySelectorAll('[data-year]');
  var currentYear = new Date().getFullYear();
  yearEls.forEach(function(el) {
    el.textContent = currentYear;
  });

  // Article reading features (TOC, Code Copy, Reading Time, Copy Link)
  var articleContent = doc.querySelector('[data-article-content]');
  if (articleContent) {
    // 1. Generate TOC
    var headings = [].slice.call(articleContent.querySelectorAll('h2, h3'));
    var toc = doc.querySelector('[data-article-toc]');
    if (toc && headings.length > 0) {
      headings.forEach(function(h, idx) {
        if (!h.id) {
          h.id = 'heading-' + (idx + 1);
        }
        var a = doc.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.dataset.target = h.id;
        if (h.tagName.toLowerCase() === 'h3') {
          a.style.paddingLeft = '20px';
          a.style.fontSize = '12px';
        }
        toc.appendChild(a);
      });

      // Active TOC observer
      if ('IntersectionObserver' in window) {
        var tocObserver = new IntersectionObserver(function(entries) {
          entries.forEach(function(entry) {
            if (entry.isIntersecting) {
              toc.querySelectorAll('a').forEach(function(link) {
                link.classList.toggle('is-active', link.dataset.target === entry.target.id);
              });
            }
          });
        }, { rootMargin: '-15% 0px -70% 0px' });

        headings.forEach(function(h) {
          tocObserver.observe(h);
        });
      }
    } else if (toc) {
      var sidebar = doc.querySelector('.air-article-sidebar');
      if (sidebar) sidebar.style.display = 'none';
      var layout = doc.querySelector('.air-article-layout');
      if (layout) layout.style.gridTemplateColumns = '1fr';
    }

    // 2. Code block copy buttons
    articleContent.querySelectorAll('pre').forEach(function(pre) {
      var copyBtn = doc.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-copy';
      copyBtn.textContent = '复制';
      copyBtn.title = '复制代码';
      copyBtn.addEventListener('click', function() {
        var code = pre.querySelector('code');
        var text = code ? code.innerText : pre.innerText;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function() {
            copyBtn.textContent = '已复制 ✓';
            setTimeout(function() {
              copyBtn.textContent = '复制';
            }, 1800);
          });
        }
      });
      pre.appendChild(copyBtn);
    });

    // 3. Reading time calculation
    var words = articleContent.innerText.replace(/\s+/g, '').length;
    var readingTimeEl = doc.querySelector('[data-reading-time]');
    if (readingTimeEl) {
      var minutes = Math.max(1, Math.ceil(words / 400));
      readingTimeEl.textContent = minutes + ' MIN READ (' + words + ' 字)';
    }

    // 4. Copy current URL
    var copyUrlBtns = doc.querySelectorAll('[data-copy-url]');
    copyUrlBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).then(function() {
            var original = btn.textContent;
            btn.textContent = '链接已复制 ✓';
            setTimeout(function() {
              btn.textContent = original;
            }, 1800);
          });
        }
      });
    });
  }

  // 5. Contact Modal & Email Copy Interaction
  var modal = doc.getElementById('air-contact-modal');
  var closeBtn = doc.getElementById('air-modal-close-btn');
  var copyAgainBtn = doc.getElementById('modal-copy-again-btn');
  var emailTextEl = doc.getElementById('modal-email-text');
  var toast = doc.getElementById('air-toast');
  var toastMsg = doc.getElementById('air-toast-message');
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
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      doc.body.appendChild(ta);
      ta.focus();
      ta.select();
      var successful = doc.execCommand('copy');
      doc.body.removeChild(ta);
      if (successful && onSuccess) onSuccess();
    } catch (err) {
      console.error('Fallback copy error:', err);
    }
  }

  var contactTriggers = doc.querySelectorAll('[data-contact-btn], a[href^="mailto:"]');
  contactTriggers.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var email = btn.getAttribute('data-email') || defaultEmail;
      copyToClipboard(email, function () {
        var originalContent = btn.innerHTML;
        btn.classList.add('is-copied');
        if (originalContent.length <= 25) {
          btn.innerHTML = '已复制 ' + email + ' ✓';
        }
        setTimeout(function () {
          btn.classList.remove('is-copied');
          btn.innerHTML = originalContent;
        }, 2400);

        showToast('已复制邮箱：' + email);
        openModal();
      });
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
  }

  if (copyAgainBtn) {
    copyAgainBtn.addEventListener('click', function () {
      copyToClipboard(defaultEmail, function () {
        var original = copyAgainBtn.textContent;
        copyAgainBtn.textContent = '已复制 ✓';
        copyAgainBtn.style.color = '#047857';
        showToast('已复制邮箱：' + defaultEmail);
        setTimeout(function () {
          copyAgainBtn.textContent = original;
          copyAgainBtn.style.color = '';
        }, 1800);
      });
    });
  }

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Remove no-js flag
  root.classList.remove('no-js');
  root.classList.add('js');
})();
