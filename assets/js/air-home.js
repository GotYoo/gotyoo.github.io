(function () {
  'use strict';

  function initTabs() {
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

    // Attach click listeners to all tab triggers
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabs);
  } else {
    initTabs();
  }
})();
