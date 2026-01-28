const initSidebar = function() {
    // 清空目录
    $("#BlogAnchor").remove();
    // 重新生成
    const haders = $("body").find("h1,h2,h3,h4,h5,h6,.h1,.h2,.h3,.h4,.h5,.h6,.sidebar-h1,.sidebar-h2,.sidebar-h3,.sidebar-h4,.sidebar-h5,.sidebar-h6");
    if (haders.length == 0) {
        return;
    }

    var links = document.links;
    for (var i = 0; i < links.length; i++) {
        if (!links[i].target) {
            if (
                links[i].hostname !== window.location.hostname ||
                /\.(?!html?)([a-z]{0,3}|[a-zt]{0,4})$/.test(links[i].pathname)
            ) {
                links[i].target = '_blank';
            }
        }
    }

    $("body").prepend('<div id="BlogAnchor" class="BlogAnchor">' +
        '<div id="AnchorContent" class="AnchorContent"> </div>' +
        '<div class="resize-handle"></div>' +
        '</div>');


    haders.each(function(i, item) {
        const tag = $(this).attr('data-tag') || $(item).get(0).tagName.toLowerCase();
        const id = API.Utils.newUid();
        const className = 'item_' + tag;
        $(item).attr("id", "wow" + id);
        $(item).addClass("wow_head");
        // 显示的内容
        const html = $(this).attr('data-sidebar') || $(this).html();
        $("#AnchorContent").css('max-height', ($(window).height() - 80) + 'px');
        $("#AnchorContent").append(`<li><a class="nav_item {0} anchor-link text-truncate" data-toggle="tooltip" data-html="true" title='{1}' href="#wow{2}">{3}</a></li>`.format(className, html, id, html));
    });

    $(".anchor-link").click(function(e) {
        e.preventDefault();
        $(".BlogAnchor li .nav_item.current").removeClass('current');
        $(this).addClass('current');
        
        // 获取目标锚点
        const targetId = $(this).attr('href');
        const $target = $(targetId);
        
        if ($target.length) {
            // 如果目标元素是隐藏的侧边栏标记，则查找其下一个可见兄弟元素
            let $scrollTarget = $target;
            if ($target.hasClass('sidebar-h1') || $target.hasClass('sidebar-h2') || 
                $target.hasClass('sidebar-h3') || $target.hasClass('sidebar-h4') ||
                $target.hasClass('sidebar-h5') || $target.hasClass('sidebar-h6')) {
                const $nextVisible = $target.next(':visible');
                if ($nextVisible.length) {
                    $scrollTarget = $nextVisible;
                }
            }
            
            // 滚动到目标位置，减去头部高度
            const offset = $scrollTarget.offset();
            if (offset) {
                $("html,body").animate({ scrollTop: offset.top - 70 }, 300);
            }
        }
    });

    // hash发生变化
    window.onhashchange = function() {
        // 减去头部高度，便于精确定位
        const $hashDom = $(location.hash);
        if ($hashDom) {
            $("html,body").animate({ scrollTop: $hashDom.offset().top - 58 });
        }
    }

    // 初始化侧边栏拖拽
    initSidebarResize();
}

// 侧边栏拖拽功能
const initSidebarResize = function() {
    const $sidebar = $('#BlogAnchor');
    const $handle = $sidebar.find('.resize-handle');
    // 增加容器类选择器，确保能匹配到各种页面的主内容区
    const $content = $('#messages_html, #albums_html, #boards_html, #shares_html, #visitors_html, #videos_html, #blogs-type-list, #friends-type-list, .albums-container, .photos-container, .videos-container');
    // 收藏页面需要调整父容器而不是 #favorites_html
    const $favoritesCard = $('.favorites-main-card');
    
    let isResizing = false;
    let startX, startWidth;

    $handle.on('mousedown', function(e) {
        isResizing = true;
        startX = e.clientX;
        startWidth = $sidebar.width();
        $handle.addClass('dragging');
        $('body').css('cursor', 'ew-resize');
        $('body').css('user-select', 'none');
        e.preventDefault();
    });

    $(document).on('mousemove', function(e) {
        if (!isResizing) return;
        
        const diff = e.clientX - startX;
        let newWidth = startWidth + diff;
        
        // 限制宽度范围
        newWidth = Math.max(150, Math.min(400, newWidth));
        
        $sidebar.css('width', newWidth + 'px');
        $content.css('margin-left', (newWidth + 10) + 'px');
        // 收藏页面调整卡片的左边距
        if ($favoritesCard.length) {
            $favoritesCard.css('margin-left', (newWidth + 10) + 'px');
        }
    });

    $(document).on('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            $handle.removeClass('dragging');
            $('body').css('cursor', '');
            $('body').css('user-select', '');
            
            // 保存宽度到 localStorage
            localStorage.setItem('sidebarWidth', $sidebar.width());
        }
    });

    // 恢复保存的宽度
    const savedWidth = localStorage.getItem('sidebarWidth');
    if (savedWidth) {
        const width = parseInt(savedWidth);
        if (width >= 150 && width <= 400) {
            $sidebar.css('width', width + 'px');
            $content.css('margin-left', (width + 10) + 'px');
            // 收藏页面恢复卡片的左边距
            if ($favoritesCard.length) {
                $favoritesCard.css('margin-left', (width + 10) + 'px');
            }
        }
    }
}

$(document).ready(initSidebar);

$(window).resize(function() {
    $("#AnchorContent").css('max-height', ($(window).height() - 80) + 'px');
});
