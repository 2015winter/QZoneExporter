$(function() {
    // 查看评论
    API.Common.registerShowCommentsWin(albums);

    // 点赞列表
    API.Common.registerShowVisitorsWin(albums);

    // 最近访问
    API.Common.registerShowLikeWin(albums);

    // 初始化提示
    $('[data-toggle="tooltip"]').tooltip({
        placement: 'auto',
        container: 'body',
        boundary: 'window'
    });

    // 计算总相册数和总照片数
    let totalAlbums = 0;
    let totalPhotos = 0;
    if (typeof albums !== 'undefined' && albums) {
        totalAlbums = albums.length;
        albums.forEach(album => {
            totalPhotos += album.photoList?.length || 0;
        });
    }
    $('#totalAlbumsCount').text(totalAlbums);
    $('#totalPhotosCount').text(totalPhotos);
});