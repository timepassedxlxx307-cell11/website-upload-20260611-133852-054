(function () {
    function toggleMenu() {
        document.body.classList.toggle("menu-open");
    }

    var menuButton = document.querySelector(".menu-toggle");
    if (menuButton) {
        menuButton.addEventListener("click", toggleMenu);
    }

    document.querySelectorAll(".mobile-panel a").forEach(function (link) {
        link.addEventListener("click", function () {
            document.body.classList.remove("menu-open");
        });
    });

    var hero = document.querySelector(".hero");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupLocalFilter() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
        if (!cards.length) {
            return;
        }
        var input = document.querySelector("[data-local-search]");
        var type = document.querySelector("[data-local-type]");
        var year = document.querySelector("[data-local-year]");

        function apply() {
            var keyword = input ? input.value.trim().toLowerCase() : "";
            var typeValue = type ? type.value : "";
            var yearValue = year ? year.value : "";
            cards.forEach(function (card) {
                var matchesKeyword = !keyword || card.getAttribute("data-title").indexOf(keyword) !== -1;
                var matchesType = !typeValue || card.getAttribute("data-type").indexOf(typeValue) !== -1;
                var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
                card.style.display = matchesKeyword && matchesType && matchesYear ? "" : "none";
            });
        }

        [input, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function renderSearch() {
        var target = document.querySelector("#search-results");
        if (!target || !window.SITE_SEARCH) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim().toLowerCase();
        var title = document.querySelector("#search-title");
        if (title) {
            title.textContent = query ? "搜索：“" + params.get("q").trim() + "”" : "影片搜索";
        }
        if (!query) {
            target.innerHTML = '<div class="empty-result">输入片名、类型、年份或地区后，可以快速查看相关影片。</div>';
            return;
        }
        var words = query.split(/\s+/).filter(Boolean);
        var results = window.SITE_SEARCH.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
            return words.every(function (word) {
                return haystack.indexOf(word) !== -1;
            });
        }).slice(0, 120);
        if (!results.length) {
            target.innerHTML = '<div class="empty-result">没有找到匹配影片，可以换一个片名、年份或题材关键词。</div>';
            return;
        }
        target.innerHTML = results.map(function (movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="./' + escapeHtml(movie.file) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-layer"></span>',
                '<span class="poster-play">▶</span>',
                '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
                '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
                '</a>',
                '<div class="card-copy">',
                '<h2><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
                '</div>',
                '</article>'
            ].join("");
        }).join("");
    }

    setupLocalFilter();
    renderSearch();
})();
