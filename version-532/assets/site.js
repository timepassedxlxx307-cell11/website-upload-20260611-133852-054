(function() {
    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function() {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function() {
                show(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.getElementById('siteSearchInput');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card, .rank-row'));
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-type]'));
    var activeType = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function cardText(card) {
        return [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.textContent
        ].join(' ');
    }

    function applySearch() {
        var keyword = normalize(input ? input.value : query);

        cards.forEach(function(card) {
            var type = card.getAttribute('data-type') || '';
            var text = normalize(cardText(card));
            var typeMatched = activeType === 'all' || type.indexOf(activeType) !== -1;
            var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
            card.classList.toggle('hidden-by-search', !(typeMatched && keywordMatched));
        });
    }

    if (input) {
        input.value = query;
        input.addEventListener('input', applySearch);
        applySearch();
    }

    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            activeType = button.getAttribute('data-filter-type') || 'all';
            buttons.forEach(function(item) {
                item.classList.toggle('active', item === button);
            });
            applySearch();
        });
    });
})();
