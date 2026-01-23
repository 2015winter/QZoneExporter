$(function() {

    // 指定年份的页面
    if (targetYear !== 'ALL') {
        videos = videos.filter(item => new Date((item.uploadtime || item.uploadTime) * 1000).getFullYear() == targetYear);
    }

    // 图片懒加载
    lazyload();

    // 创建视频弹窗
    function createVideoModal() {
        if ($('#videoModal').length > 0) return;
        
        const modalHtml = `
            <div id="videoModal" class="video-modal">
                <div class="video-modal-content">
                    <button class="video-modal-close" title="关闭">&times;</button>
                    <video id="modalVideo" controls preload="metadata"></video>
                </div>
            </div>
        `;
        $('body').append(modalHtml);

        // 点击遮罩关闭
        $('#videoModal').on('click', function(e) {
            if (e.target === this) {
                closeVideoModal();
            }
        });

        // 关闭按钮
        $('.video-modal-close').on('click', closeVideoModal);

        // ESC 键关闭
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $('#videoModal').is(':visible')) {
                closeVideoModal();
            }
        });
    }

    // 关闭弹窗
    function closeVideoModal() {
        const video = $('#modalVideo')[0];
        if (video) {
            video.pause();
            video.src = '';
        }
        $('#videoModal').fadeOut(200);
    }

    // 弹窗播放视频
    function playVideoInModal(videoSrc, posterSrc) {
        createVideoModal();
        const video = $('#modalVideo')[0];
        video.poster = posterSrc || '';
        video.src = videoSrc;
        $('#videoModal').fadeIn(200);
        video.play().catch(err => console.warn('视频播放失败:', err));
    }

    // 全屏播放视频
    function playVideoFullscreen(videoSrc, posterSrc) {
        createVideoModal();
        const video = $('#modalVideo')[0];
        video.poster = posterSrc || '';
        video.src = videoSrc;
        $('#videoModal').fadeIn(200);
        video.play().then(() => {
            requestFullscreen(video);
        }).catch(err => console.warn('视频播放失败:', err));
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

    // 视频播放功能
    function initVideoPlayer() {
        // 点击播放按钮 - 弹窗播放
        $('.play-btn').on('click', function(e) {
            e.stopPropagation();
            const wrapper = $(this).closest('.video-wrapper');
            const videoSrc = wrapper.data('video-src');
            const posterSrc = wrapper.data('poster');
            if (videoSrc) {
                playVideoInModal(videoSrc, posterSrc);
            }
        });

        // 点击全屏按钮 - 全屏播放
        $('.btn-fullscreen').on('click', function(e) {
            e.stopPropagation();
            const wrapper = $(this).closest('.video-wrapper');
            const videoSrc = wrapper.data('video-src');
            const posterSrc = wrapper.data('poster');
            if (videoSrc) {
                playVideoFullscreen(videoSrc, posterSrc);
            }
        });

        // 点击封面图片 - 弹窗播放
        $('.video-poster').on('click', function(e) {
            e.stopPropagation();
            const wrapper = $(this).closest('.video-wrapper');
            const videoSrc = wrapper.data('video-src');
            const posterSrc = wrapper.data('poster');
            if (videoSrc) {
                playVideoInModal(videoSrc, posterSrc);
            }
        });
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
