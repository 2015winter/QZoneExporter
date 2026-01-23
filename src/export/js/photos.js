$(function() {

    // 获取相册ID
    albumId = albumId !== '<%:=(albumId)%>' ? albumId : API.Utils.getUrlParam('albumId');
    // 获取指定相册数据
    const albumIndex = albums.getIndex(albumId, 'id');
    window.album = albums[albumIndex];

    // 渲染导航相册名称
    $(".breadcrumb-item.active").text(album.name);

    // 非静态页面，需要生成相片列表，静态页面默认生成
    // 获取模板元素
    const photos_tpl = document.getElementById('photos_tpl').innerHTML;
    // 生成模板
    const photos_html = template(photos_tpl, { album: album || {} });
    // 渲染模板到页面
    $("#lightgallery").html(photos_html);

    // 图片懒加载
    lazyload();

    // ==================== 自定义小窗预览功能 ====================
    
    // 预览状态管理
    const previewState = {
        currentIndex: 0,
        photoList: album.photoList || [],
        isFullscreen: false
    };

    // 获取预览DOM元素
    const $overlay = $('#photoPreviewOverlay');
    const $content = $('#previewContent');
    const $title = $('#previewTitle');
    const $info = $('#previewInfo');
    const $loading = $('#previewLoading');
    const $btnPrev = $('#btnPrevPhoto');
    const $btnNext = $('#btnNextPhoto');
    const $btnFullscreen = $('#btnFullscreen');
    const $btnClose = $('#btnClosePreview');

    // 打开预览弹窗
    function openPreview(index) {
        previewState.currentIndex = index;
        updatePreviewContent();
        $overlay.addClass('show');
        $('body').css('overflow', 'hidden');
        updateNavButtons();
    }

    // 关闭预览弹窗
    function closePreview() {
        $overlay.removeClass('show fullscreen-mode');
        previewState.isFullscreen = false;
        $btnFullscreen.find('i').removeClass('fa-compress').addClass('fa-expand');
        $btnFullscreen.attr('title', '全屏查看');
        $('body').css('overflow', '');
        // 暂停视频播放
        $content.find('video').each(function() {
            this.pause();
        });
    }

    // 更新预览内容
    function updatePreviewContent() {
        const photo = previewState.photoList[previewState.currentIndex];
        if (!photo) return;

        $loading.addClass('show');
        $content.find('img, video').remove();

        // 设置标题
        const title = photo.name || API.Utils.formatDate(photo.uploadtime || photo.uploadTime) || '相片预览';
        $title.text(title);

        // 判断是视频还是图片
        if (photo.is_video && photo.video_info) {
            // 视频类型
            const videoSrc = API.Common.getMediaPath(photo.video_info.video_url, photo.custom_filepath, true) || '../Common/images/loading.gif';
            const videoPoster = API.Common.getMediaPath(photo.custom_url || photo.pre, photo.custom_pre_filepath, true) || '../Common/images/loading.gif';
            
            const $video = $('<video>', {
                controls: true,
                poster: videoPoster,
                preload: 'metadata'
            }).append($('<source>', {
                src: videoSrc,
                type: 'video/mp4'
            }));

            $video.on('loadeddata', function() {
                $loading.removeClass('show');
            }).on('error', function() {
                $loading.removeClass('show');
            });

            $content.append($video);
        } else {
            // 图片类型
            const photoHref = API.Common.getMediaPath(photo.custom_url, photo.custom_filepath, true) || '../Common/images/loading.gif';
            
            const $img = $('<img>', {
                src: photoHref,
                alt: title
            });

            $img.on('load', function() {
                $loading.removeClass('show');
            }).on('error', function() {
                $loading.removeClass('show');
                $(this).attr('src', '../Common/images/loading.gif');
            });

            $content.append($img);
        }

        // 更新底部信息
        updatePreviewInfo(photo);
    }

    // 更新预览信息
    function updatePreviewInfo(photo) {
        let infoHtml = '';
        
        // 尺寸信息
        const width = photo.is_video && photo.video_info ? (photo.video_info.cover_width || 0) : (photo.width || 0);
        const height = photo.is_video && photo.video_info ? (photo.video_info.cover_height || 0) : (photo.height || 0);
        if (width && height) {
            infoHtml += `<span class="info-item"><i class="fa fa-arrows-alt"></i> ${width} x ${height}</span>`;
        }

        // 文件大小
        const size = photo.is_video && photo.video_info ? (photo.video_info.size || 0) : (photo.photocubage || 0);
        if (size) {
            infoHtml += `<span class="info-item"><i class="fa fa-file-o"></i> ${API.Utils.formatFileSize(size)}</span>`;
        }

        // 文件类型
        const type = photo.is_video ? 'MP4' : API.Photos.getPhotoType(photo);
        if (type) {
            infoHtml += `<span class="info-item"><i class="fa fa-image"></i> ${type}</span>`;
        }

        // 时间
        const time = (photo.rawshoottime || photo.shootTime) || (photo.uploadtime || photo.uploadTime);
        if (time) {
            infoHtml += `<span class="info-item"><i class="fa fa-clock-o"></i> ${API.Utils.formatDate(time)}</span>`;
        }

        // 位置
        const lbs = API.Photos.getPhotoLbs(photo);
        if (lbs && (lbs.idname || lbs.name)) {
            infoHtml += `<span class="info-item"><i class="fa fa-map-marker"></i> ${lbs.idname || lbs.name}</span>`;
        }

        // 序号
        infoHtml += `<span class="info-item"><i class="fa fa-list-ol"></i> ${previewState.currentIndex + 1} / ${previewState.photoList.length}</span>`;

        $info.html(infoHtml);
    }

    // 更新导航按钮状态
    function updateNavButtons() {
        $btnPrev.prop('disabled', previewState.currentIndex <= 0);
        $btnNext.prop('disabled', previewState.currentIndex >= previewState.photoList.length - 1);
    }

    // 上一张
    function prevPhoto() {
        if (previewState.currentIndex > 0) {
            // 暂停当前视频
            $content.find('video').each(function() {
                this.pause();
            });
            previewState.currentIndex--;
            updatePreviewContent();
            updateNavButtons();
        }
    }

    // 下一张
    function nextPhoto() {
        if (previewState.currentIndex < previewState.photoList.length - 1) {
            // 暂停当前视频
            $content.find('video').each(function() {
                this.pause();
            });
            previewState.currentIndex++;
            updatePreviewContent();
            updateNavButtons();
        }
    }

    // 全屏查看 - 页面内全屏模式
    function toggleFullscreen() {
        previewState.isFullscreen = !previewState.isFullscreen;
        if (previewState.isFullscreen) {
            $overlay.addClass('fullscreen-mode');
            $btnFullscreen.find('i').removeClass('fa-expand').addClass('fa-compress');
            $btnFullscreen.attr('title', '退出全屏');
        } else {
            $overlay.removeClass('fullscreen-mode');
            $btnFullscreen.find('i').removeClass('fa-compress').addClass('fa-expand');
            $btnFullscreen.attr('title', '全屏查看');
        }
    }

    // 绑定事件
    $btnClose.on('click', closePreview);
    $btnPrev.on('click', prevPhoto);
    $btnNext.on('click', nextPhoto);
    $btnFullscreen.on('click', toggleFullscreen);

    // 点击遮罩层关闭
    $overlay.on('click', function(e) {
        if (e.target === this) {
            closePreview();
        }
    });

    // 键盘操作
    $(document).on('keydown', function(e) {
        if (!$overlay.hasClass('show')) return;
        
        switch(e.keyCode) {
            case 27: // ESC
                if (previewState.isFullscreen) {
                    toggleFullscreen(); // 先退出全屏模式
                } else {
                    closePreview();
                }
                break;
            case 37: // 左箭头
                prevPhoto();
                break;
            case 39: // 右箭头
                nextPhoto();
                break;
            case 70: // F 全屏
                toggleFullscreen();
                break;
        }
    });

    // ==================== 绑定小窗预览点击事件 ====================
    
    // 直接在每个 .lightbox 元素上绑定点击事件（在 lightGallery 初始化前）
    $('#lightgallery .lightbox').each(function(index) {
        $(this).on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            openPreview(index);
            return false;
        });
    });

    // ==================== lightGallery 初始化 ====================

    // 相册画廊
    const $gallery = document.getElementById('lightgallery');
    $gallery.moduleName = 'Albums';

    // 注册监听
    API.Common.registerEvents($gallery);

    // 实例化画廊相册（保留用于其他功能，但不绑定点击）
    const galleryIns = lightGallery($gallery, {
        plugins: [
            lgZoom,
            lgAutoplay,
            lgComment,
            lgFullscreen,
            lgHash,
            lgRotate,
            lgThumbnail,
            lgVideo
        ],
        mode: 'lg-fade',
        selector: '.lightbox-disabled', // 使用不存在的选择器，禁用自动绑定
        download: false,
        mousewheel: true,
        thumbnail: true,
        commentBox: true,
        loop: false,
        autoplayVideoOnSlide: false,
        commentsMarkup: '<div id="lg-comment-box" class="lg-comment-box lg-fb-comment-box"><div class="lg-comment-header"><h3 class="lg-comment-title">评论</h3><span class="lg-comment-close lg-icon"></span></div><div class="lg-comment-body"></div></div>'
    });

    $gallery.galleryIns = galleryIns;

    // 查看赞
    $('.viewlikes').on('click', function() {
        API.Common.showLikeWin(this, album.photoList);
    });

    // 查看评论
    $('.viewcomments').on('click', function() {
        API.Common.showCommentsWin(this, album.photoList);
    });

    // 取消懒加载样式
    API.Common.registerImageLoadedEvent();

    // 初始化提示
    $('[data-toggle="tooltip"]').tooltip({
        placement: 'auto',
        container: 'body',
        boundary: 'window'
    })

});
