$(function() {

    // 重新渲染左侧目录
    initSidebar();

    // 图片懒加载
    lazyload();

    // 取消懒加载样式
    API.Common.registerImageLoadedEvent();

    // 初始化提示
    $('[data-toggle="tooltip"]').tooltip();

});
