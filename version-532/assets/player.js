import { H as Hls } from './hls-vendor-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function(shell) {
    var video = shell.querySelector('video[data-m3u8]');
    var button = shell.querySelector('.player-start');
    var status = shell.querySelector('.player-status');
    var source = video ? video.getAttribute('data-m3u8') : '';
    var started = false;
    var hls = null;

    function setStatus(text) {
        if (status) {
            status.textContent = text || '';
        }
    }

    function attachSource() {
        if (!video || !source) {
            setStatus('播放源不可用');
            return Promise.reject(new Error('missing video source'));
        }

        if (started) {
            return Promise.resolve();
        }

        started = true;
        setStatus('正在加载播放源');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                setStatus('播放源已就绪');
            });
            hls.on(Hls.Events.ERROR, function(event, data) {
                if (data && data.fatal) {
                    setStatus('播放加载失败，请稍后重试');
                    if (hls) {
                        hls.destroy();
                        hls = null;
                    }
                    started = false;
                }
            });
            return Promise.resolve();
        }

        video.src = source;
        return Promise.resolve();
    }

    function play() {
        attachSource()
            .then(function() {
                shell.classList.add('is-playing');
                return video.play();
            })
            .then(function() {
                setStatus('正在播放');
            })
            .catch(function() {
                shell.classList.remove('is-playing');
                setStatus('点击视频控件继续播放');
            });
    }

    if (button) {
        button.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('play', function() {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function() {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove('is-playing');
            }
        });
    }
});
