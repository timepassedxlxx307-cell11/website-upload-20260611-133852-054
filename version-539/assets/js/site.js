(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showHero(parseInt(dot.getAttribute("data-hero-dot"), 10) || 0);
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        showHero(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        showHero(current + 1);
      });
    }
    window.setInterval(function () {
      showHero(current + 1);
    }, 5600);
  }

  function applyFilter(scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
    var empty = scope.querySelector("[data-empty-state]") || document.querySelector("[data-empty-state]");
    var input = document.querySelector('[data-site-search][data-scope="#' + scope.id + '"]');
    var query = normalize(input ? input.value : "");
    var activeButton = document.querySelector(".filter-button.is-active");
    var filterValue = normalize(activeButton ? activeButton.getAttribute("data-filter-value") : "");
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search") + " " + card.getAttribute("data-genre") + " " + card.textContent);
      var matchedQuery = !query || text.indexOf(query) !== -1;
      var matchedFilter = !filterValue || text.indexOf(filterValue) !== -1;
      var show = matchedQuery && matchedFilter;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
  searchInputs.forEach(function (input) {
    var selector = input.getAttribute("data-scope");
    var scope = selector ? document.querySelector(selector) : document;
    if (!scope) {
      return;
    }
    input.addEventListener("input", function () {
      applyFilter(scope);
    });
  });

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var group = button.parentElement;
      Array.prototype.slice.call(group.querySelectorAll("[data-filter-value]")).forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      var hero = button.closest(".page-hero");
      var input = hero ? hero.querySelector("[data-site-search]") : document.querySelector("[data-site-search]");
      var selector = input ? input.getAttribute("data-scope") : "";
      var scope = selector ? document.querySelector(selector) : document;
      if (scope) {
        applyFilter(scope);
      }
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get("q");
  if (q) {
    var mainSearch = document.querySelector("[data-site-search]");
    if (mainSearch) {
      mainSearch.value = q;
      var scopeSelector = mainSearch.getAttribute("data-scope");
      var mainScope = scopeSelector ? document.querySelector(scopeSelector) : document;
      if (mainScope) {
        applyFilter(mainScope);
      }
    }
  }
})();
