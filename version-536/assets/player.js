(function () {
    function prepareVideo(stage) {
        var video = stage.querySelector("video");
        var source = stage.getAttribute("data-play");
        if (!video || !source) {
            return null;
        }
        if (stage.getAttribute("data-ready") === "1") {
            return video;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            stage.hlsInstance = hls;
        } else {
            video.src = source;
        }
        stage.setAttribute("data-ready", "1");
        return video;
    }

    function start(stage) {
        var video = prepareVideo(stage);
        if (!video) {
            return;
        }
        stage.classList.add("is-playing");
        video.controls = true;
        var playTask = video.play();
        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {});
        }
    }

    document.querySelectorAll(".watch-stage").forEach(function (stage) {
        var video = stage.querySelector("video");
        var button = stage.querySelector(".play-overlay");
        if (button) {
            button.addEventListener("click", function () {
                start(stage);
            });
        }
        if (video) {
            video.addEventListener("click", function () {
                if (stage.getAttribute("data-ready") !== "1") {
                    start(stage);
                }
            });
        }
    });
})();
