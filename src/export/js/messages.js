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

    // 点击图片查看时，实例化画廊相册
    $('.lightgallery .message-lightbox').on('click', function() {

        // 画廊相册DOM
        const $galleryDom = $(this).parent().get(0);
        const $clickedItem = $(this);
        
        // 获取当前容器下所有的 .message-lightbox 元素
        const $allItems = $(this).parent().find('.message-lightbox');
        
        // 计算被点击元素在同级元素中的实际索引位置（基于DOM顺序）
        const actualIdx = $allItems.index($clickedItem);
        
        if ($galleryDom.galleryIns) {
            $galleryDom.galleryIns.openGallery(actualIdx >= 0 ? actualIdx : 0);
            return;
        }

        // 注册监听
        $galleryDom.moduleName = 'Messages';
        API.Common.registerEvents($galleryDom);

        // 实例化画廊相册
        const galleryIns = lightGallery($galleryDom, {
            plugins: [
                lgZoom,
                lgAutoplay,
                lgComment,
                lgFullscreen,
                lgRotate,
                lgThumbnail,
                lgVideo
            ],
            mode: 'lg-fade',
            selector: '.message-lightbox',
            download: false,
            thumbnail: false,
            mousewheel: true,
            commentBox: true,
            loop: false,
            autoplayVideoOnSlide: false,
            commentsMarkup: '<div id="lg-comment-box" class="lg-comment-box lg-fb-comment-box"><div class="lg-comment-header"><h3 class="lg-comment-title">评论</h3><span class="lg-comment-close lg-icon"></span></div><div class="lg-comment-body"></div></div>'
        });

        $galleryDom.galleryIns = galleryIns;

        // 打开画廊，使用实际的DOM索引
        galleryIns.openGallery(actualIdx >= 0 ? actualIdx : 0);
    })

    // 查看评论中的图片
    $('.comment-lightgallery .comment-img-lightbox').on('click', function() {
        // 画廊相册DOM
        const $galleryDom = $(this).parent().parent().get(0);
        // 点击的图片的索引位置
        const imgIdx = $(this).attr('data-idx');

        if ($galleryDom.galleryIns) {
            $galleryDom.galleryIns.openGallery(imgIdx * 1);
            return;
        }

        // 实例化画廊相册
        const galleryIns = lightGallery($galleryDom, {
            plugins: [
                lgZoom,
                lgFullscreen,
                lgThumbnail,
                lgRotate
            ],
            mode: 'lg-fade',
            selector: '.comment-img-lightbox',
            download: false,
            thumbnail: false,
            loop: false
        });
        $galleryDom.galleryIns = galleryIns;

        // 打开画廊
        galleryIns.openGallery(imgIdx * 1);
    })

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