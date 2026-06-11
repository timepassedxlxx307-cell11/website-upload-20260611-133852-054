import { H as Hls } from './hls-vendor-dru42stk.js';

function setupPlayer(player) {
  var video = player.querySelector('video[data-hls]');
  var playLayer = player.querySelector('[data-play-layer]');
  var message = player.querySelector('[data-player-message]');
  var hls = null;
  var loaded = false;

  if (!video) {
    return;
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function loadSource() {
    var source = video.getAttribute('data-hls');

    if (loaded || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      loaded = true;
      setMessage('播放器已加载，点击播放即可观看。');
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      loaded = true;
      setMessage('HLS 播放源已绑定，正在准备播放。');
      return;
    }

    setMessage('当前浏览器暂不支持 HLS 播放，请更换支持 HLS 的浏览器访问。');
  }

  function play() {
    loadSource();

    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
      });
    }
  }

  if (playLayer) {
    playLayer.addEventListener('click', play);
  }

  video.addEventListener('play', function () {
    if (playLayer) {
      playLayer.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (playLayer && video.currentTime === 0) {
      playLayer.classList.remove('is-hidden');
    }
  });

  video.addEventListener('error', function () {
    setMessage('播放源暂时无法加载，请稍后重试或切换浏览器。');
  });

  player.addEventListener('destroy', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(setupPlayer);
});
