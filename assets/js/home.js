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

  // Remove no-js flag
  root.classList.remove('no-js');
  root.classList.add('js');
})();
