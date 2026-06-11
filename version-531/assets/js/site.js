(function () {
  function selectAll(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', carousel);
    var dots = selectAll('[data-hero-dot]', carousel);
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function setupHeroSearch() {
    var form = document.querySelector('[data-hero-search]');

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var value = input ? input.value.trim() : '';
      var target = form.getAttribute('action') || 'search.html';

      if (value) {
        window.location.href = target + '?q=' + encodeURIComponent(value);
      } else {
        window.location.href = target;
      }
    });
  }

  function setupFiltering() {
    var filterInput = document.querySelector('[data-filter-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var countOutput = document.querySelector('[data-filter-count]');
    var emptyState = document.querySelector('[data-empty-state]');
    var cards = selectAll('[data-card]');

    if (!cards.length || (!filterInput && !yearFilter && !regionFilter)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && filterInput) {
      filterInput.value = query;
    }

    function matchesYear(card, selectedYear) {
      var year = parseInt(card.getAttribute('data-year') || '0', 10);

      if (!selectedYear) {
        return true;
      }

      if (selectedYear === 'older') {
        return year < 2020;
      }

      return String(year) === selectedYear;
    }

    function applyFilters() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var selectedYear = yearFilter ? yearFilter.value : '';
      var selectedRegion = regionFilter ? regionFilter.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchable = (card.getAttribute('data-title') || '').toLowerCase();
        var region = card.getAttribute('data-region') || '';
        var ok = true;

        if (keyword && searchable.indexOf(keyword) === -1) {
          ok = false;
        }

        if (ok && selectedYear && !matchesYear(card, selectedYear)) {
          ok = false;
        }

        if (ok && selectedRegion && region.indexOf(selectedRegion) === -1) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';

        if (ok) {
          visible += 1;
        }
      });

      if (countOutput) {
        countOutput.textContent = '当前显示 ' + visible + ' 条影片';
      }

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    [filterInput, yearFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  function setupBackToTop() {
    var button = document.querySelector('[data-back-to-top]');

    if (!button) {
      return;
    }

    function sync() {
      button.classList.toggle('is-visible', window.scrollY > 620);
    }

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupHeroSearch();
    setupFiltering();
    setupBackToTop();
  });
})();
