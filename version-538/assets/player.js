(function () {
  function createMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var streamUrl = config.src;
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button || !streamUrl) {
      return;
    }

    function hideButton() {
      button.classList.add('is-hidden');
    }

    function showMessage() {
      hideButton();
      video.controls = false;
      var shell = video.parentElement;
      if (shell) {
        var message = document.createElement('div');
        message.className = 'player-message';
        message.textContent = '播放加载失败，请刷新页面重试';
        message.style.position = 'absolute';
        message.style.inset = '0';
        message.style.display = 'flex';
        message.style.alignItems = 'center';
        message.style.justifyContent = 'center';
        message.style.color = '#ffffff';
        message.style.background = '#000000';
        shell.appendChild(message);
      }
    }

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            showMessage();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        showMessage();
      }
    }

    function play() {
      load();
      hideButton();
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', hideButton);
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.createMoviePlayer = createMoviePlayer;
})();
