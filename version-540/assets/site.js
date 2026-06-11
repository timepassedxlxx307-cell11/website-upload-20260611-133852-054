(function () {
  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');

  function setHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.grid-search'));
  searchInputs.forEach(function (input) {
    var grid = input.closest('section').querySelector('.searchable-grid');
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('.movie-card')) : [];

    function filterCards() {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    }

    input.addEventListener('input', filterCards);

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q');
    if (initial) {
      input.value = initial;
      filterCards();
      input.focus();
    }
  });

  var frames = Array.prototype.slice.call(document.querySelectorAll('.player-frame'));
  frames.forEach(function (frame) {
    var video = frame.querySelector('video');
    var button = frame.querySelector('.play-cover');
    var source = video ? video.querySelector('source') : null;
    var url = source ? source.getAttribute('src') : '';
    var hlsInstance = null;

    function attachVideo() {
      if (!video || !url || frame.getAttribute('data-ready') === '1') {
        return;
      }
      frame.setAttribute('data-ready', '1');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(url);
        hlsInstance.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      if (!video) {
        return;
      }
      attachVideo();
      frame.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          frame.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          frame.classList.remove('is-playing');
        }
      });
      video.addEventListener('emptied', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  });
})();
