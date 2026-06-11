(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var video = document.getElementById("moviePlayer");
    var layer = document.querySelector("[data-player-layer]");
    var source = window.__videoConfig && window.__videoConfig.source;
    var mounted = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    function mountSource(onReady) {
      if (mounted) {
        onReady();
        return;
      }
      mounted = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        onReady();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hls.loadSource(source);
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          onReady();
        });
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            try {
              hls.destroy();
            } catch (error) {}
            video.src = source;
          }
        });
        return;
      }
      video.src = source;
      onReady();
    }

    function startPlayback() {
      if (layer) {
        layer.classList.add("is-hidden");
      }
      mountSource(playVideo);
    }

    if (layer) {
      layer.addEventListener("click", startPlayback);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });
  });
})();
