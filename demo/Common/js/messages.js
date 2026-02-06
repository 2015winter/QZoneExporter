/**
 * 说说
 */

$(function() {

    // 那年今日功能已移至导航页(index.html)，年份页面不再显示

    // 动态为卡片添加id（用于锚点定位）
    addCardIds();
    
    // 处理锚点跳转（因为id是动态添加的，需要手动滚动）
    scrollToAnchor();

    // 动态插入年份标题和月份分割栏
    insertYearAndMonthHeaders();

    // 重新渲染左侧目录
    initSidebar();

    // 图片懒加载
    lazyload();

    // ==================== 动态创建预览弹窗DOM ====================
    if (!$('#messagePreviewOverlay').length) {
        const previewModalHtml = `
        <div class="photo-preview-overlay" id="messagePreviewOverlay">
            <div class="photo-preview-modal">
                <div class="photo-preview-header">
                    <span class="photo-preview-title" id="messagePreviewTitle">媒体预览</span>
                    <div class="photo-preview-actions">
                        <button class="photo-preview-btn btn-fullscreen" id="btnMessageFullscreen" title="全屏查看">
                            <i class="fa fa-expand"></i>
                        </button>
                        <button class="photo-preview-btn btn-close-preview" id="btnCloseMessagePreview" title="关闭">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                </div>
                <button class="photo-preview-nav prev" id="btnPrevMessage" title="上一张">
                    <i class="fa fa-chevron-left"></i>
                </button>
                <div class="photo-preview-content" id="messagePreviewContent">
                    <div class="photo-preview-loading" id="messagePreviewLoading">加载中...</div>
                </div>
                <button class="photo-preview-nav next" id="btnNextMessage" title="下一张">
                    <i class="fa fa-chevron-right"></i>
                </button>
                <div class="photo-preview-footer">
                    <div class="photo-preview-info" id="messagePreviewInfo"></div>
                </div>
            </div>
        </div>`;
        $('body').append(previewModalHtml);
    }

    // ==================== 自定义小窗预览功能 ====================
    
    // 预览状态管理
    const previewState = {
        currentIndex: 0,
        currentItems: [], // 当前说说的所有媒体项
        isFullscreen: false
    };

    // 获取预览DOM元素
    const $overlay = $('#messagePreviewOverlay');
    const $content = $('#messagePreviewContent');
    const $title = $('#messagePreviewTitle');
    const $info = $('#messagePreviewInfo');
    const $loading = $('#messagePreviewLoading');
    const $btnPrev = $('#btnPrevMessage');
    const $btnNext = $('#btnNextMessage');
    const $btnFullscreen = $('#btnMessageFullscreen');
    const $btnClose = $('#btnCloseMessagePreview');

    // 打开预览弹窗
    function openPreview(items, index) {
        previewState.currentItems = items;
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
        const item = previewState.currentItems[previewState.currentIndex];
        if (!item) return;

        $loading.addClass('show');
        $content.find('img, video').remove();

        // 设置标题
        const title = item.title || '说说媒体预览';
        $title.text(title);

        if (item.isVideo) {
            // 视频类型
            const $video = $('<video>', {
                controls: true,
                poster: item.poster || '',
                preload: 'metadata'
            }).append($('<source>', {
                src: item.src,
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
            const $img = $('<img>', {
                src: item.src,
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

        // 更新信息栏
        const indexInfo = `${previewState.currentIndex + 1} / ${previewState.currentItems.length}`;
        $info.html(`
            <span class="info-item"><i class="fa fa-image"></i> ${indexInfo}</span>
            ${item.time ? `<span class="info-item"><i class="fa fa-clock-o"></i> ${item.time}</span>` : ''}
        `);
    }

    // 更新导航按钮状态
    function updateNavButtons() {
        $btnPrev.prop('disabled', previewState.currentIndex <= 0);
        $btnNext.prop('disabled', previewState.currentIndex >= previewState.currentItems.length - 1);
    }

    // 上一张
    function showPrev() {
        if (previewState.currentIndex > 0) {
            // 暂停当前视频
            $content.find('video').each(function() { this.pause(); });
            previewState.currentIndex--;
            updatePreviewContent();
            updateNavButtons();
        }
    }

    // 下一张
    function showNext() {
        if (previewState.currentIndex < previewState.currentItems.length - 1) {
            // 暂停当前视频
            $content.find('video').each(function() { this.pause(); });
            previewState.currentIndex++;
            updatePreviewContent();
            updateNavButtons();
        }
    }

    // 切换全屏模式（页面内全屏）
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
    $btnPrev.on('click', showPrev);
    $btnNext.on('click', showNext);
    $btnFullscreen.on('click', toggleFullscreen);

    // 点击遮罩层关闭
    $overlay.on('click', function(e) {
        if (e.target === this) {
            closePreview();
        }
    });

    // 键盘导航
    $(document).on('keydown', function(e) {
        if (!$overlay.hasClass('show')) return;
        
        switch(e.keyCode) {
            case 27: // ESC
                closePreview();
                break;
            case 37: // 左箭头
                showPrev();
                break;
            case 39: // 右箭头
                showNext();
                break;
        }
    });

    // 从 lightbox 元素收集媒体数据
    function collectMediaItems($container) {
        const items = [];
        $container.find('.message-lightbox').each(function() {
            const $item = $(this);
            const videoData = $item.attr('data-video');
            const imgSrc = $item.attr('data-src') || $item.find('img').attr('data-src') || $item.find('img').attr('src');
            const poster = $item.attr('data-poster');
            
            if (videoData) {
                // 视频
                try {
                    const video = JSON.parse(videoData);
                    const videoSrc = video.source && video.source[0] && video.source[0].src;
                    if (videoSrc) {
                        items.push({
                            isVideo: true,
                            src: videoSrc,
                            poster: poster || '',
                            title: '视频'
                        });
                    }
                } catch (e) {
                    console.error('解析视频数据失败:', e);
                }
            } else if (imgSrc) {
                // 图片
                items.push({
                    isVideo: false,
                    src: imgSrc,
                    title: '图片'
                });
            }
        });
        return items;
    }

    // 点击图片/视频查看（说说主体：支持左右切换）
    $('.lightgallery .message-lightbox').on('click', function(e) {
        e.preventDefault();
        
        const $container = $(this).closest('.lightgallery');
        const $clickedItem = $(this);
        const $allItems = $container.find('.message-lightbox');
        const clickedIndex = $allItems.index($clickedItem);
        
        // 收集当前说说的所有媒体项
        const items = collectMediaItems($container);
        
        if (items.length > 0) {
            // 显示导航按钮和计数信息
            $btnPrev.show();
            $btnNext.show();
            $info.show();
            openPreview(items, clickedIndex >= 0 ? clickedIndex : 0);
        }
    });

    // 查看评论中的图片/视频（简化版：只预览单个，有关闭和全屏按钮）
    $('.comment-lightgallery .comment-img-lightbox').on('click', function(e) {
        e.preventDefault();
        
        const $el = $(this);
        const videoData = $el.attr('data-video');
        const imgSrc = $el.attr('data-src') || $el.find('img').attr('data-src') || $el.find('img').attr('src');
        
        let item = null;
        if (videoData) {
            try {
                const video = JSON.parse(videoData);
                const videoSrc = video.source && video.source[0] && video.source[0].src;
                if (videoSrc) {
                    item = { isVideo: true, src: videoSrc, poster: $el.attr('data-poster') || '', title: '评论视频' };
                }
            } catch (e) {}
        } else if (imgSrc) {
            item = { isVideo: false, src: imgSrc, title: '评论图片' };
        }
        
        if (item) {
            $btnPrev.hide();
            $btnNext.hide();
            $info.hide();
            openPreview([item], 0);
        }
    });

    // 点赞列表
    API.Common.registerShowVisitorsWin(messages);

    // 最近访问
    API.Common.registerShowLikeWin(messages);

    // 查看全文
    API.Common.registerReadMoreEvents();

    // 取消懒加载样式
    API.Common.registerImageLoadedEvent();

    // 初始化提示
    $('[data-toggle="tooltip"]').tooltip();

});

/**
 * 处理锚点跳转（因为id是动态添加的，浏览器自动锚点已错过）
 */
function scrollToAnchor() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#msg-')) {
        // 延迟执行确保DOM已更新
        setTimeout(function() {
            const $target = $(hash);
            if ($target.length) {
                // 滚动到目标位置，考虑固定头部的高度
                const headerHeight = 70;
                const targetOffset = $target.offset().top - headerHeight;
                $('html, body').animate({
                    scrollTop: targetOffset
                }, 300);
                // 高亮目标卡片
                $target.addClass('anchor-highlight');
                setTimeout(function() {
                    $target.removeClass('anchor-highlight');
                }, 2000);
            }
        }, 100);
    }
}

/**
 * 动态为每个说说卡片添加id（用于锚点定位）
 */
function addCardIds() {
    // 查找所有包含 data-target 的点赞按钮，获取tid
    $('.card .viewlikes[data-target]').each(function() {
        const tid = $(this).attr('data-target');
        const $card = $(this).closest('.card');
        if (tid && !$card.attr('id')) {
            $card.attr('id', 'msg-' + tid);
        }
    });
}

/**
 * 动态插入年份标题和月份分割栏
 */
function insertYearAndMonthHeaders() {
    // 处理年份标题
    $('.sidebar-h1').each(function() {
        const $yearHeader = $(this);
        const sidebarText = $yearHeader.attr('data-sidebar');
        
        // 提取年份和数量，如 "2017年<span class='badge...'>10<span>"
        const yearMatch = sidebarText.match(/^(\d+)年/);
        const countMatch = sidebarText.match(/>(\d+)</);
        
        if (yearMatch) {
            const year = yearMatch[1];
            const count = countMatch ? countMatch[1] : '';
            
            // 检查是否已存在年份标题
            if (!$yearHeader.next('.content-year-header').length) {
                const yearHeaderHtml = `
                    <div class="content-year-header">
                        <span class="content-year-badge">${year}年</span>
                        <span class="content-year-count">共 ${count} 条说说</span>
                    </div>
                `;
                $yearHeader.after(yearHeaderHtml);
            }
        }
    });
    
    // 处理月份分割栏
    $('.sidebar-h2').each(function() {
        const $monthHeader = $(this);
        const sidebarText = $monthHeader.attr('data-sidebar');
        
        // 提取月份和数量，如 "12月<span class='badge...'>1<span>"
        const monthMatch = sidebarText.match(/^(\d+)月/);
        const countMatch = sidebarText.match(/>(\d+)</);
        
        if (monthMatch) {
            const month = monthMatch[1];
            const count = countMatch ? countMatch[1] : '';
            
            // 检查是否已存在月份分割栏
            if (!$monthHeader.next('.content-month-divider').length) {
                const monthDividerHtml = `
                    <div class="content-month-divider">
                        <span class="content-month-badge">${month}月</span>
                        <span class="content-month-count">${count} 条</span>
                        <span class="content-month-line"></span>
                    </div>
                `;
                $monthHeader.after(monthDividerHtml);
            }
        }
    });
}