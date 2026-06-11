(function () {
  window.MoviePlayer = {
    start: function (url) {
      var video = document.getElementById("movie-video");
      var mask = document.getElementById("player-mask");
      var ready = false;
      var hls = null;

      function prepare() {
        if (!video || ready) {
          return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          video.load();
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
          video.load();
        }
      }

      function play() {
        prepare();
        if (mask) {
          mask.classList.add("is-hidden");
        }
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      }

      if (!video) {
        return;
      }

      prepare();

      if (mask) {
        mask.addEventListener("click", function () {
          play();
        });
      }

      video.addEventListener("play", function () {
        prepare();
        if (mask) {
          mask.classList.add("is-hidden");
        }
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };
})();
