$(function() {

    // 指定年份的页面
    if (targetYear !== 'ALL') {
        videos = videos.filter(item => new Date((item.uploadtime || item.uploadTime) * 1000).getFullYear() == targetYear);
    }

    // 图片懒加载
    lazyload();

    // 视频播放功能
    function initVideoPlayer() {
        // 点击播放按钮 - 在卡片内播放
        $('.play-btn').on('click', function(e) {
            e.stopPropagation();
            const wrapper = $(this).closest('.video-wrapper');
            playVideoInCard(wrapper, false);
        });

        // 点击全屏按钮 - 全屏播放
        $('.btn-fullscreen').on('click', function(e) {
            e.stopPropagation();
            const wrapper = $(this).closest('.video-wrapper');
            playVideoInCard(wrapper, true);
        });

        // 点击封面图片 - 在卡片内播放
        $('.video-poster').on('click', function(e) {
            e.stopPropagation();
            const wrapper = $(this).closest('.video-wrapper');
            playVideoInCard(wrapper, false);
        });
    }

    // 在卡片内播放视频
    function playVideoInCard(wrapper, fullscreen) {
        const videoSrc = wrapper.data('video-src');
        const posterSrc = wrapper.data('poster');
        
        if (!videoSrc) {
            console.warn('视频源不存在');
            return;
        }

        // 检查是否已有视频元素
        let video = wrapper.find('video');
        if (video.length === 0) {
            // 创建视频元素
            video = $('<video></video>', {
                'class': 'card-video',
                'controls': true,
                'preload': 'metadata',
                'poster': posterSrc
            });
            video.append($('<source>', {
                'src': videoSrc,
                'type': 'video/mp4'
            }));
            wrapper.append(video);
        }

        // 隐藏封面和播放按钮
        wrapper.find('.video-poster, .play-btn').hide();
        wrapper.find('.btn-fullscreen').hide();
        video.show();

        // 播放视频
        const videoEl = video[0];
        videoEl.play().then(() => {
            if (fullscreen) {
                requestFullscreen(videoEl);
            }
        }).catch(err => {
            console.warn('视频播放失败:', err);
        });

        // 视频结束后显示封面
        video.off('ended').on('ended', function() {
            resetVideoCard(wrapper);
        });

        // 暂停后双击可以重置
        video.off('dblclick').on('dblclick', function() {
            if (videoEl.paused) {
                resetVideoCard(wrapper);
            }
        });
    }

    // 重置视频卡片
    function resetVideoCard(wrapper) {
        wrapper.find('video').hide();
        wrapper.find('.video-poster, .play-btn, .btn-fullscreen').show();
    }

    // 请求全屏
    function requestFullscreen(el) {
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
    }

    // 初始化视频播放器
    initVideoPlayer();

    // 查看赞
    $('.viewlikes').on('click', function() {
        API.Common.showLikeWin(this, videos);
    });

    // 查看评论
    $('.viewcomments').on('click', function() {
        API.Common.showCommentsWin(this, videos);
    });

    // 取消懒加载样式
    API.Common.registerImageLoadedEvent();

    // 初始化提示
    $('[data-toggle="tooltip"]').tooltip();

});
