$(function() {

    // 指定年份的页面
    if (targetYear !== 'ALL') {
        videos = videos.filter(item => new Date((item.uploadtime || item.uploadTime) * 1000).getFullYear() == targetYear);
    }

    // 图片懒加载
    lazyload();

    // 视频列表管理
    let videoList = [];
    let currentVideoIndex = 0;

    // 收集所有视频信息
    function collectVideoList() {
        videoList = [];
        $('.video-wrapper').each(function(index) {
            const $wrapper = $(this);
            const $card = $wrapper.closest('.card');
            const videoSrc = $wrapper.data('video-src');
            const posterSrc = $wrapper.data('poster');
            const title = $card.find('.card-title').text() || '视频播放';
            // 获取上传时间
            const $detail = $card.find('.photo-detail');
            const uploadTime = $detail.find('.fa-camera').text() || '';
            // 获取点赞和评论数
            const likes = $card.find('.viewlikes').text() || '0';
            const comments = $card.find('.viewcomments').text() || '0';
            
            if (videoSrc) {
                videoList.push({
                    index: index,
                    src: videoSrc,
                    poster: posterSrc,
                    title: title,
                    uploadTime: uploadTime,
                    likes: likes,
                    comments: comments
                });
            }
        });
    }

    // 创建视频弹窗 - 与相片预览风格统一
    function createVideoModal() {
        if ($('#videoModal').length > 0) return;
        
        const modalHtml = `
            <div id="videoModal" class="video-modal">
                <div class="video-modal-content">
                    <div class="video-modal-header">
                        <span class="video-modal-title"><i class="fa fa-video-camera mr-2"></i>视频播放</span>
                        <div class="video-modal-counter">1 / 1</div>
                        <div class="video-modal-actions">
                            <button class="video-modal-btn btn-download-video" title="下载视频"><i class="fa fa-download"></i></button>
                            <button class="video-modal-btn btn-fullscreen-video" title="全屏"><i class="fa fa-expand"></i></button>
                            <button class="video-modal-btn btn-close-video" title="关闭"><i class="fa fa-times"></i></button>
                        </div>
                    </div>
                    <div class="video-modal-body">
                        <video id="modalVideo" controls preload="metadata"></video>
                    </div>
                    <div class="video-modal-footer">
                        <div class="video-modal-info">
                            <span class="info-item info-time"><i class="fa fa-clock-o"></i><span class="info-value">--</span></span>
                            <span class="info-item info-likes"><i class="fa fa-heart"></i><span class="info-value">0</span></span>
                            <span class="info-item info-comments"><i class="fa fa-comment"></i><span class="info-value">0</span></span>
                        </div>
                    </div>
                    <button class="video-nav-btn video-nav-prev" title="上一个"><i class="fa fa-chevron-left"></i></button>
                    <button class="video-nav-btn video-nav-next" title="下一个"><i class="fa fa-chevron-right"></i></button>
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
        $('.btn-close-video').on('click', closeVideoModal);

        // 下载按钮
        $('.btn-download-video').on('click', function() {
            const videoInfo = videoList[currentVideoIndex];
            if (!videoInfo || !videoInfo.src) return;
            
            const fileName = (videoInfo.title || '视频').replace(/[\\/:*?"<>|]/g, '_') + '.mp4';
            const link = document.createElement('a');
            link.href = videoInfo.src;
            link.download = fileName;
            link.click();
        });

        // 全屏按钮 - 页内全屏
        $('.btn-fullscreen-video').on('click', function() {
            $('#videoModal').toggleClass('fullscreen-mode');
            const $icon = $(this).find('i');
            if ($('#videoModal').hasClass('fullscreen-mode')) {
                $icon.removeClass('fa-expand').addClass('fa-compress');
            } else {
                $icon.removeClass('fa-compress').addClass('fa-expand');
            }
        });

        // 上一个视频
        $('.video-nav-prev').on('click', function(e) {
            e.stopPropagation();
            navigateVideo(-1);
        });

        // 下一个视频
        $('.video-nav-next').on('click', function(e) {
            e.stopPropagation();
            navigateVideo(1);
        });

        // 键盘事件
        $(document).on('keydown.videoModal', function(e) {
            if (!$('#videoModal').is(':visible')) return;
            
            switch(e.key) {
                case 'Escape':
                    closeVideoModal();
                    break;
                case 'ArrowLeft':
                    navigateVideo(-1);
                    break;
                case 'ArrowRight':
                    navigateVideo(1);
                    break;
            }
        });
    }

    // 切换视频
    function navigateVideo(direction) {
        if (videoList.length === 0) return;
        
        const video = $('#modalVideo')[0];
        if (video) {
            video.pause();
        }
        
        currentVideoIndex += direction;
        if (currentVideoIndex < 0) {
            currentVideoIndex = videoList.length - 1;
        } else if (currentVideoIndex >= videoList.length) {
            currentVideoIndex = 0;
        }
        
        const videoInfo = videoList[currentVideoIndex];
        loadVideo(videoInfo);
    }

    // 加载视频
    function loadVideo(videoInfo) {
        const video = $('#modalVideo')[0];
        video.poster = videoInfo.poster || '';
        video.src = videoInfo.src;
        
        // 更新标题
        $('.video-modal-title').html('<i class="fa fa-video-camera mr-2"></i>' + videoInfo.title);
        
        // 更新计数器
        $('.video-modal-counter').text((currentVideoIndex + 1) + ' / ' + videoList.length);
        
        // 更新底部信息
        $('.info-time .info-value').text(videoInfo.uploadTime || '--');
        $('.info-likes .info-value').text(videoInfo.likes);
        $('.info-comments .info-value').text(videoInfo.comments);
        
        // 更新导航按钮状态
        updateNavButtons();
        
        video.play().catch(err => console.warn('视频播放失败:', err));
    }

    // 更新导航按钮状态
    function updateNavButtons() {
        const hasPrev = videoList.length > 1;
        const hasNext = videoList.length > 1;
        $('.video-nav-prev').toggle(hasPrev);
        $('.video-nav-next').toggle(hasNext);
    }

    // 关闭弹窗
    function closeVideoModal() {
        const video = $('#modalVideo')[0];
        if (video) {
            video.pause();
        }
        // 添加 closing 类，保持内容位置不变，只做淡出
        $('#videoModal').addClass('closing').removeClass('show');
        // 重置全屏按钮图标
        $('.btn-fullscreen-video i').removeClass('fa-compress').addClass('fa-expand');
        setTimeout(() => {
            $('#videoModal').removeClass('closing fullscreen-mode').css('display', 'none');
            if (video) {
                video.src = '';
            }
        }, 400);
    }

    // 弹窗播放视频
    function playVideoInModal(videoIndex) {
        collectVideoList();
        createVideoModal();
        
        currentVideoIndex = videoIndex;
        const videoInfo = videoList[currentVideoIndex];
        
        $('#videoModal').css('display', 'flex');
        setTimeout(() => {
            $('#videoModal').addClass('show');
        }, 10);
        
        loadVideo(videoInfo);
    }

    // 页内全屏播放视频
    function playVideoFullscreen(videoIndex) {
        collectVideoList();
        createVideoModal();
        
        currentVideoIndex = videoIndex;
        const videoInfo = videoList[currentVideoIndex];
        
        $('#videoModal').css('display', 'flex');
        setTimeout(() => {
            $('#videoModal').addClass('show fullscreen-mode');
            $('.btn-fullscreen-video i').removeClass('fa-expand').addClass('fa-compress');
        }, 10);
        
        loadVideo(videoInfo);
    }

    // 获取视频在列表中的索引
    function getVideoIndex($wrapper) {
        let index = 0;
        $('.video-wrapper').each(function(i) {
            if ($(this).is($wrapper)) {
                index = i;
                return false;
            }
        });
        // 找到在有效视频列表中的索引
        collectVideoList();
        for (let i = 0; i < videoList.length; i++) {
            if (videoList[i].index === index) {
                return i;
            }
        }
        return 0;
    }

    // 视频播放功能
    function initVideoPlayer() {
        // 使用事件委托绑定，同时支持 click 和 touchend（移动端优先响应 touchend）
        $(document).on('click touchend', '.play-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === 'touchend') e.stopImmediatePropagation(); // 阻止后续 click
            
            const wrapper = $(this).closest('.video-wrapper');
            const videoSrc = wrapper.data('video-src');
            if (videoSrc) {
                const videoIndex = getVideoIndex(wrapper);
                playVideoInModal(videoIndex);
            }
        });

        // 全屏按钮
        $(document).on('click touchend', '.btn-fullscreen', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === 'touchend') e.stopImmediatePropagation();
            
            const wrapper = $(this).closest('.video-wrapper');
            const videoSrc = wrapper.data('video-src');
            if (videoSrc) {
                const videoIndex = getVideoIndex(wrapper);
                playVideoFullscreen(videoIndex);
            }
        });

        // 封面图片
        $(document).on('click touchend', '.video-poster', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const wrapper = $(this).closest('.video-wrapper');
            const videoSrc = wrapper.data('video-src');
            if (videoSrc) {
                const videoIndex = getVideoIndex(wrapper);
                playVideoInModal(videoIndex);
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
