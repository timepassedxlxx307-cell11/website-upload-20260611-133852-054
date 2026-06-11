(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupHeader();
    setupMobileNav();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });

  function setupHeader() {
    var header = document.querySelector('[data-site-header]');
    if (!header) {
      return;
    }

    function updateHeader() {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      document.body.classList.toggle('nav-open', panel.classList.contains('is-open'));
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
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
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var queryInputs = document.querySelectorAll('[data-url-query]');
    var initialQuery = new URLSearchParams(window.location.search).get('q') || '';
    queryInputs.forEach(function (input) {
      input.value = initialQuery;
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var empty = scope.querySelector('[data-empty-state]');
      if (!input || cards.length === 0) {
        return;
      }

      function filterCards() {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = card.getAttribute('data-search') || '';
          var matched = keyword === '' || haystack.indexOf(keyword) !== -1;
          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      input.addEventListener('input', filterCards);
      filterCards();
    });
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player-box]').forEach(function (box) {
      var video = box.querySelector('video');
      var overlay = box.querySelector('[data-video-src]');
      if (!video || !overlay) {
        return;
      }

      var source = overlay.getAttribute('data-video-src');
      var loaded = false;
      var hlsInstance = null;

      function attachSource() {
        if (loaded) {
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }

        loaded = true;
      }

      function playVideo() {
        attachSource();
        video.controls = true;
        overlay.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            overlay.classList.remove('is-hidden');
          });
        }
      }

      overlay.addEventListener('click', playVideo);
      video.addEventListener('click', function () {
        if (!loaded || video.paused) {
          playVideo();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
}());
