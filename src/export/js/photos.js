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

    // ==================== 布局和统计功能 ====================
    
    const $gallery = $('#lightgallery');
    const photoList = album.photoList || [];
    
    // 统计相片和视频数量（基于DOM元素）
    const $photoItems = $gallery.find('.photo-item');
    const totalCount = $photoItems.length;
    const videoCount = $gallery.find('.photo-video').length;
    const photoCount = totalCount - videoCount;
    
    $('#photoCount').text(photoCount + ' 张相片');
    $('#videoCount').text(videoCount + ' 个视频');

    // 当前布局状态
    let currentLayout = 'timeline';

    // 布局切换
    $('.layout-controls [data-layout]').on('click', function() {
        const layout = $(this).data('layout');
        if (layout === currentLayout) return;
        
        $('.layout-controls [data-layout]').removeClass('active');
        $(this).addClass('active');
        currentLayout = layout;
        
        applyLayout(layout);
    });

    // 应用布局
    function applyLayout(layout) {
        $gallery.removeClass('layout-grid layout-timeline layout-masonry row');
        
        if (layout === 'grid') {
            $gallery.addClass('layout-grid row');
            restoreGridLayout();
            // 恢复Bootstrap列类
            $gallery.find('.photo-item').addClass('col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6');
        } else if (layout === 'timeline') {
            $gallery.addClass('layout-timeline');
            // 移除Bootstrap列类
            $gallery.find('.photo-item').removeClass('col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 mb-3');
            applyTimelineLayout();
        } else if (layout === 'masonry') {
            $gallery.addClass('layout-masonry');
            restoreGridLayout();
            // 移除Bootstrap列类
            $gallery.find('.photo-item').removeClass('col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6 mb-3');
        }
        
        rebindPreviewEvents();
        lazyload();
    }

    // 恢复网格布局
    function restoreGridLayout() {
        // 移除时间线分组
        $gallery.find('.timeline-group').each(function() {
            $(this).find('.photo-item').appendTo($gallery);
        });
        $gallery.find('.timeline-group').remove();
    }

    // 应用时间线布局
    function applyTimelineLayout() {
        const $items = $gallery.find('.photo-item').detach();
        const groups = {};
        
        // 按月份分组
        $items.each(function() {
            const time = $(this).data('time');
            let dateKey = '未知时间';
            if (time) {
                const date = new Date(time * 1000);
                if (!isNaN(date.getTime())) {
                    dateKey = date.getFullYear() + '年' + (date.getMonth() + 1) + '月';
                }
            }
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(this);
        });
        
        // 按时间排序分组
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            if (a === '未知时间') return 1;
            if (b === '未知时间') return -1;
            return b.localeCompare(a);
        });
        
        // 创建分组DOM
        sortedKeys.forEach(function(key) {
            const $group = $('<div class="timeline-group"></div>');
            const $header = $('<div class="timeline-header"><span class="timeline-date">' + key + '</span><span class="timeline-count">' + groups[key].length + ' 张</span></div>');
            const $photos = $('<div class="timeline-photos"></div>');
            
            groups[key].forEach(function(item) {
                $(item).removeClass('col-xl-2 col-lg-3 col-md-4 col-sm-6 col-6');
                $photos.append(item);
            });
            
            $group.append($header).append($photos);
            $gallery.append($group);
        });
    }

    // 排序功能
    $('.dropdown-item[data-sort]').on('click', function(e) {
        e.preventDefault();
        const sort = $(this).data('sort');
        
        $('.dropdown-item[data-sort]').removeClass('active');
        $(this).addClass('active');
        
        sortPhotos(sort);
    });

    // 排序相片
    function sortPhotos(sortType) {
        let $items;
        
        if (currentLayout === 'timeline') {
            // 时间线布局需要重新整理
            $items = $gallery.find('.photo-item').detach();
            $gallery.find('.timeline-group').remove();
        } else {
            $items = $gallery.find('.photo-item').detach();
        }
        
        const itemsArray = $items.toArray();
        
        itemsArray.sort(function(a, b) {
            const timeA = $(a).data('time') || 0;
            const timeB = $(b).data('time') || 0;
            
            if (sortType === 'time-desc') {
                return timeB - timeA;
            } else if (sortType === 'time-asc') {
                return timeA - timeB;
            } else if (sortType === 'name') {
                const nameA = $(a).find('.card-title').text() || '';
                const nameB = $(b).find('.card-title').text() || '';
                return nameA.localeCompare(nameB);
            }
            return 0;
        });
        
        // 重新添加到DOM
        if (currentLayout === 'timeline') {
            itemsArray.forEach(function(item) {
                $gallery.append(item);
            });
            applyTimelineLayout();
        } else {
            itemsArray.forEach(function(item) {
                $gallery.append(item);
            });
        }
        
        rebindPreviewEvents();
        lazyload();
    }

    // 初始化默认布局为时间线
    applyLayout('timeline');

    // ==================== 自定义小窗预览功能 ====================
    
    // 预览状态管理
    const previewState = {
        currentIndex: 0,
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

    // 获取当前 DOM 顺序的所有 lightbox 元素
    function getCurrentLightboxes() {
        return $('#lightgallery .lightbox').toArray();
    }

    // 根据 lightbox 元素获取对应的 photo 数据
    function getPhotoFromLightbox($lightbox) {
        const $item = $($lightbox).closest('.photo-item');
        const itemTime = $item.data('time') || 0;
        
        // 获取图片/视频的 src 来精确匹配
        const imgSrc = $($lightbox).find('img').attr('data-src') || $($lightbox).find('img').attr('src') || '';
        const isVideo = $($lightbox).find('.photo-video').length > 0;
        
        // 遍历 photoList 查找匹配的照片
        for (let i = 0; i < photoList.length; i++) {
            const photo = photoList[i];
            const photoTime = (photo.rawshoottime || photo.shootTime) || (photo.uploadtime || photo.uploadTime) || 0;
            
            if (photoTime == itemTime) {
                // 进一步通过图片路径验证
                if (isVideo && photo.is_video) {
                    return photo;
                } else if (!isVideo && !photo.is_video) {
                    const photoSrc = API.Common.getMediaPath(photo.custom_url || photo.pre, photo.custom_pre_filepath || photo.custom_filepath, true) || '';
                    if (imgSrc.indexOf(photoSrc) !== -1 || photoSrc.indexOf(imgSrc.split('/').pop()) !== -1) {
                        return photo;
                    }
                    // 时间匹配就返回（作为fallback）
                    return photo;
                }
            }
        }
        
        // Fallback: 返回第一个时间匹配的
        for (let i = 0; i < photoList.length; i++) {
            const photo = photoList[i];
            const photoTime = (photo.rawshoottime || photo.shootTime) || (photo.uploadtime || photo.uploadTime) || 0;
            if (photoTime == itemTime) {
                return photo;
            }
        }
        
        return null;
    }

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
        const lightboxes = getCurrentLightboxes();
        const currentLightbox = lightboxes[previewState.currentIndex];
        if (!currentLightbox) return;

        const photo = getPhotoFromLightbox(currentLightbox);
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
        const lightboxes = getCurrentLightboxes();
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
        infoHtml += `<span class="info-item"><i class="fa fa-list-ol"></i> ${previewState.currentIndex + 1} / ${lightboxes.length}</span>`;

        $info.html(infoHtml);
    }

    // 更新导航按钮状态
    function updateNavButtons() {
        const lightboxes = getCurrentLightboxes();
        $btnPrev.prop('disabled', previewState.currentIndex <= 0);
        $btnNext.prop('disabled', previewState.currentIndex >= lightboxes.length - 1);
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
        const lightboxes = getCurrentLightboxes();
        if (previewState.currentIndex < lightboxes.length - 1) {
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
    
    // 绑定预览点击事件
    function bindPreviewEvents() {
        $('#lightgallery .lightbox').each(function(index) {
            $(this).off('click').on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                openPreview(index);
                return false;
            });
        });
    }

    // 重新绑定预览事件（布局切换后调用）
    function rebindPreviewEvents() {
        bindPreviewEvents();
    }

    // 初始绑定
    bindPreviewEvents();

    // ==================== lightGallery 初始化 ====================

    // 相册画廊（使用原生 DOM 元素）
    const galleryEl = document.getElementById('lightgallery');
    galleryEl.moduleName = 'Albums';

    // 注册监听
    API.Common.registerEvents(galleryEl);

    // 实例化画廊相册（保留用于其他功能，但不绑定点击）
    const galleryIns = lightGallery(galleryEl, {
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

    galleryEl.galleryIns = galleryIns;

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
