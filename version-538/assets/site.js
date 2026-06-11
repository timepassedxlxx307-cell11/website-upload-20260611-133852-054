(function () {
  function normalize(value) {
    return (value || '').toString().toLowerCase().replace(/\s+/g, '');
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid]'));
    if (!grids.length) {
      return;
    }

    var searchInput = document.querySelector('[data-live-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var sortFilter = document.querySelector('[data-sort-filter]');
    var queryInput = document.querySelector('[data-query-input]');

    if (queryInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        queryInput.value = query;
      }
    }

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = yearFilter ? yearFilter.value : '';

      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardYear = card.getAttribute('data-year') || '';
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedYear = !year || cardYear === year;
          card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
        });

        if (sortFilter && sortFilter.value !== 'default') {
          var sorted = cards.slice().sort(function (a, b) {
            var ay = parseInt(a.getAttribute('data-year') || '0', 10);
            var by = parseInt(b.getAttribute('data-year') || '0', 10);
            return sortFilter.value === 'year-asc' ? ay - by : by - ay;
          });
          sorted.forEach(function (card) {
            grid.appendChild(card);
          });
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', apply);
    }
    if (sortFilter) {
      sortFilter.addEventListener('change', apply);
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFilters();
  });
})();
