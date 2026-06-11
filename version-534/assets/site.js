import { H as Hls } from './hls-vendor.js';

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function setupImageFallback() {
  document.addEventListener('error', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || !target.matches('img[data-fallback]')) {
      return;
    }
    const frame = target.closest('.poster-frame');
    if (frame) {
      frame.classList.add('poster-missing');
    }
  }, true);
}

function setupMobileNav() {
  const toggle = qs('[data-nav-toggle]');
  const nav = qs('[data-main-nav]');
  const search = qs('.nav-search');
  if (!toggle || !nav) {
    return;
  }
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    if (search) {
      search.classList.toggle('is-open');
    }
  });
}

function setupCarousels() {
  qsa('[data-carousel]').forEach((carousel) => {
    const slides = qsa('[data-carousel-slide]', carousel);
    const prevButton = qs('[data-carousel-prev]', carousel);
    const nextButton = qs('[data-carousel-next]', carousel);
    const dotsWrap = qs('[data-carousel-dots]', carousel);
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = null;

    if (slides.length <= 1) {
      return;
    }

    const dots = slides.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `切换到第 ${index + 1} 张`);
      dot.addEventListener('click', () => showSlide(index, true));
      if (dotsWrap) {
        dotsWrap.appendChild(dot);
      }
      return dot;
    });

    function showSlide(index, userAction = false) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
      if (userAction) {
        restartTimer();
      }
    }

    function restartTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
    }

    prevButton?.addEventListener('click', () => showSlide(activeIndex - 1, true));
    nextButton?.addEventListener('click', () => showSlide(activeIndex + 1, true));
    carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
    carousel.addEventListener('mouseleave', restartTimer);
    showSlide(activeIndex);
    restartTimer();
  });
}

function setupFilters() {
  const grid = qs('[data-filter-grid]');
  if (!grid) {
    return;
  }

  const cards = qsa('[data-movie-card]', grid);
  const searchInput = qs('[data-filter-search]');
  const yearSelect = qs('[data-filter-year]');
  const typeSelect = qs('[data-filter-type]');
  const regionInput = qs('[data-filter-region]');
  const categorySelect = qs('[data-filter-category]');
  const resultCount = qs('[data-result-count]');
  const emptyState = qs('[data-empty-state]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');

  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    const query = normalize(searchInput?.value);
    const year = normalize(yearSelect?.value);
    const type = normalize(typeSelect?.value);
    const region = normalize(regionInput?.value);
    const category = normalize(categorySelect?.value);
    let visible = 0;

    cards.forEach((card) => {
      const matchesQuery = !query || normalize(card.dataset.search).includes(query);
      const matchesYear = !year || normalize(card.dataset.year).includes(year);
      const matchesType = !type || normalize(card.dataset.type).includes(type);
      const matchesRegion = !region || normalize(card.dataset.region).includes(region);
      const matchesCategory = !category || normalize(card.dataset.category) === category;
      const shouldShow = matchesQuery && matchesYear && matchesType && matchesRegion && matchesCategory;

      card.hidden = !shouldShow;
      if (shouldShow) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = String(visible);
    }
    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [searchInput, yearSelect, typeSelect, regionInput, categorySelect].forEach((control) => {
    control?.addEventListener('input', applyFilters);
    control?.addEventListener('change', applyFilters);
  });

  applyFilters();
}

function setupPlayer() {
  const video = qs('[data-hls-player]');
  if (!video) {
    return;
  }

  const shell = qs('[data-player-shell]') || video.parentElement;
  const playButton = qs('[data-play-button]');
  const message = qs('[data-player-message]');
  const source = video.dataset.hlsSrc;
  let initialized = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function initializePlayer() {
    if (initialized || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      initialized = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_eventName, data) => {
        if (data?.fatal) {
          setMessage('当前播放源加载失败，请稍后重试。');
        }
      });
      video._hlsInstance = hls;
      initialized = true;
      return;
    }

    setMessage('当前浏览器暂不支持 HLS 播放。');
  }

  async function startPlayback() {
    initializePlayer();
    try {
      await video.play();
      shell?.classList.add('is-playing');
      setMessage('');
    } catch (error) {
      setMessage('请再次点击播放，或检查浏览器的自动播放设置。');
    }
  }

  playButton?.addEventListener('click', startPlayback);
  video.addEventListener('play', () => shell?.classList.add('is-playing'));
  video.addEventListener('pause', () => shell?.classList.remove('is-playing'));
  video.addEventListener('loadedmetadata', () => setMessage(''));
  initializePlayer();
}

setupImageFallback();
setupMobileNav();
setupCarousels();
setupFilters();
setupPlayer();
