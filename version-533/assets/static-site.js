const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const button = $('[data-menu-toggle]');
  const panel = $('[data-mobile-panel]');

  if (!button || !panel) {
    return;
  }

  button.addEventListener('click', () => {
    button.classList.toggle('is-open');
    panel.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const slides = $$('[data-hero-slide]');
  const dots = $$('[data-hero-dot]');
  const prev = $('[data-hero-prev]');
  const next = $('[data-hero-next]');

  if (!slides.length) {
    return;
  }

  let activeIndex = 0;
  let timer = null;

  const show = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, idx) => {
      slide.classList.toggle('is-active', idx === activeIndex);
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === activeIndex);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(activeIndex + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      show(index);
      start();
    });
  });

  prev?.addEventListener('click', () => {
    show(activeIndex - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(activeIndex + 1);
    start();
  });

  const carousel = $('.hero-carousel');
  carousel?.addEventListener('mouseenter', stop);
  carousel?.addEventListener('mouseleave', start);
  start();
}

function setupCardFilter() {
  const panel = $('[data-filter-panel]');
  const input = $('[data-card-filter]');
  const clear = $('[data-filter-clear]');
  const list = $('[data-filter-list]');
  const count = $('[data-filter-count]');

  if (!panel || !input || !list) {
    return;
  }

  const cards = $$('.movie-card', list);

  const filter = () => {
    const keyword = input.value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year,
        card.dataset.category,
      ].join(' ').toLowerCase();
      const matched = !keyword || haystack.includes(keyword);
      card.hidden = !matched;

      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `${visible} 部`;
    }
  };

  input.addEventListener('input', filter);
  clear?.addEventListener('click', () => {
    input.value = '';
    filter();
    input.focus();
  });
}

async function setupPlayer() {
  const video = $('[data-hls-player]');

  if (!video) {
    return;
  }

  const source = video.dataset.src;
  const overlay = $('[data-play-button]');

  if (!source) {
    video.insertAdjacentHTML('afterend', '<p class="player-error">视频源暂不可用</p>');
    return;
  }

  let hls = null;

  const attachSource = async () => {
    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
      return;
    }

    try {
      const module = await import('./hls-vendor.js');
      const Hls = module.H;

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video.dataset.ready = 'true';
      } else {
        video.src = source;
        video.dataset.ready = 'true';
      }
    } catch (error) {
      console.warn('HLS 初始化失败，尝试使用浏览器原生播放。', error);
      video.src = source;
      video.dataset.ready = 'true';
    }
  };

  await attachSource();

  overlay?.addEventListener('click', async () => {
    await attachSource();

    try {
      await video.play();
      overlay.classList.add('is-hidden');
    } catch (error) {
      overlay.classList.add('is-hidden');
      video.focus();
    }
  });

  video.addEventListener('play', () => overlay?.classList.add('is-hidden'));
  video.addEventListener('pause', () => overlay?.classList.remove('is-hidden'));

  window.addEventListener('beforeunload', () => {
    if (hls) {
      hls.destroy();
    }
  });
}

function createSearchCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');

  return `
    <article class="movie-card" data-title="${escapeHtml(movie.title)}" data-genre="${escapeHtml(movie.genre)}" data-region="${escapeHtml(movie.region)}" data-year="${escapeHtml(movie.year)}">
      <a class="poster-wrap" href="${escapeHtml(movie.url)}" aria-label="观看 ${escapeHtml(movie.title)}">
        <img class="poster-image" src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy" onerror="this.closest('.poster-wrap').classList.add('is-missing'); this.remove();" />
        <span class="poster-fallback">影视在线</span>
        <span class="play-chip">立即观看</span>
      </a>
      <div class="movie-card-body">
        <div class="movie-meta-line">
          <a href="category-${escapeHtml(movie.categorySlug)}.html">${escapeHtml(movie.category)}</a>
          <span>${escapeHtml(movie.year)}</span>
        </div>
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.summary)}</p>
        <div class="tag-row">${tags}</div>
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setupSearchPage() {
  const results = $('[data-search-results]');
  const title = $('[data-search-title]');
  const count = $('[data-search-count]');
  const empty = $('[data-search-empty]');
  const input = $('[data-search-input]');

  if (!results || !window.MOVIE_SEARCH_INDEX) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();

  if (input) {
    input.value = query;
  }

  if (!query) {
    return;
  }

  const lowered = query.toLowerCase();
  const matched = window.MOVIE_SEARCH_INDEX.filter((movie) => {
    const haystack = [
      movie.title,
      movie.category,
      movie.year,
      movie.region,
      movie.type,
      movie.genre,
      (movie.tags || []).join(' '),
      movie.summary,
    ].join(' ').toLowerCase();
    return haystack.includes(lowered);
  });

  if (title) {
    title.textContent = `“${query}” 的搜索结果`;
  }

  if (count) {
    count.textContent = `${matched.length} 部`;
  }

  empty.hidden = matched.length > 0;
  results.innerHTML = matched.slice(0, 120).map(createSearchCard).join('');

  if (matched.length > 120) {
    results.insertAdjacentHTML('afterend', `<p class="search-limit-note">共找到 ${matched.length} 部，已展示前 120 部，请尝试更精确的关键词。</p>`);
  }
}

function setupSmoothAnchor() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = $(link.getAttribute('href'));

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHeroCarousel();
  setupCardFilter();
  setupPlayer();
  setupSearchPage();
  setupSmoothAnchor();
});
