/**
 * 一键导出媒体到本地目录模块
 *
 * 独立于常规备份流程，仅导出相册照片与视频至用户选择的本地文件夹。
 *
 * 目录结构（根目录为「QQ空间媒体_QQ号」）：
 *   - 相册：Albums/{分类}/{相册名}/
 *   - 视频：Videos/videos/、Videos/covers/（封面）
 *
 * 实现说明：
 *   - 采集与命名复用内容脚本既有 API。
 *   - 文件经 background 跨域抓取后以 base64 回传，规避内容脚本的 MV3 CORS 限制。
 *   - 落盘采用 File System Access API，需由弹窗内的用户点击触发。
 *   - 单项失败仅跳过并计入统计，不影响整体流程。
 *
 * @license Apache-2.0
 */

API.MediaExport = API.MediaExport || {};

// 运行时状态
API.MediaExport.state = {
    running: false,
    everRun: false, // 是否已完成过至少一次导出，用于按钮文案切换
    options: {
        includePhotos: true,
        includeVideos: true,
        albums: [] // 用户在 popup 选择的相册（为空表示全部相册）
    },
    stats: { total: 0, done: 0, failed: 0, skipped: 0 }
};

// 目录句柄缓存（key 为相对路径，value 为 Promise<FileSystemDirectoryHandle>）
API.MediaExport._dirCache = new Map();

/**
 * 显示导出弹窗（由 content.js 收到 popup 的 startMediaExport 消息后调用）
 * @param {Object} request { includePhotos, includeVideos, albums }
 */
API.MediaExport.show = function(request) {
    request = request || {};
    const opt = API.MediaExport.state.options;
    opt.includePhotos = request.includePhotos !== false;
    opt.includeVideos = request.includeVideos !== false;
    opt.albums = request.albums || [];

    API.MediaExport.injectUI();
    API.MediaExport.open();

    // 清空日志与进度
    $('#qzmLog').empty();
    API.MediaExport.state.stats = { total: 0, done: 0, failed: 0, skipped: 0 };
    API.MediaExport.updateProgress();

    const scope = [];
    if (opt.includePhotos) {
        scope.push(opt.albums.length ? ('相册照片（已选 ' + opt.albums.length + ' 个相册）') : '相册照片（全部相册）');
    }
    if (opt.includeVideos) {
        scope.push('视频');
    }
    const scopeText = scope.join('、') || '（未选择任何内容）';
    $('#qzmScope').text(scopeText + ' · 独立于常规备份');
    API.MediaExport.log('待导出：' + scopeText + '。点击右下角【选择文件夹并开始导出】选择一个本地目录后开始。', 'info');
};

/**
 * 注入弹窗 UI（仅注入一次）
 */
API.MediaExport.injectUI = function() {
    if (document.getElementById('qzmExportOverlay')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'qzmExportStyle';
    style.textContent = [
        '@keyframes qzmFadeIn{from{opacity:0}to{opacity:1}}',
        '@keyframes qzmPop{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:none}}',
        '#qzmExportOverlay{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(15,18,26,.5);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);animation:qzmFadeIn .15s ease;}',
        '#qzmExportOverlay *{box-sizing:border-box;}',
        '#qzmExportOverlay .qzm-card{width:600px;max-width:94vw;max-height:88vh;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.3);display:flex;flex-direction:column;overflow:hidden;animation:qzmPop .22s cubic-bezier(.2,.8,.25,1);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;color:#1f2329;}',
        '#qzmExportOverlay .qzm-head{padding:18px 22px;background:linear-gradient(135deg,#27ae60,#1e8e52);color:#fff;display:flex;align-items:flex-start;justify-content:space-between;}',
        '#qzmExportOverlay .qzm-head-main{display:flex;align-items:center;gap:12px;}',
        '#qzmExportOverlay .qzm-head-icon{width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex:0 0 auto;}',
        '#qzmExportOverlay .qzm-head-icon svg{width:22px;height:22px;fill:#fff;}',
        '#qzmExportOverlay .qzm-title{font-size:17px;font-weight:600;margin:0;line-height:1.3;}',
        '#qzmExportOverlay .qzm-subtitle{font-size:12px;opacity:.9;margin:2px 0 0;line-height:1.4;}',
        '#qzmExportOverlay .qzm-close{border:0;background:rgba(255,255,255,.12);color:#fff;width:30px;height:30px;border-radius:8px;font-size:18px;line-height:1;cursor:pointer;transition:background .15s;flex:0 0 auto;}',
        '#qzmExportOverlay .qzm-close:hover{background:rgba(255,255,255,.28);}',
        'html.qzm-no-scroll{overflow:hidden !important;}',
        '#qzmExportOverlay .qzm-body{padding:18px 22px;overflow:auto;overscroll-behavior:contain;}',
        '#qzmExportOverlay .qzm-desc{font-size:12px;color:#8a9099;margin:0 0 14px;line-height:1.7;}',
        '#qzmExportOverlay .qzm-progress{height:10px;background:#eef0f2;border-radius:999px;overflow:hidden;margin:0 0 4px;}',
        '#qzmExportOverlay .qzm-bar{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,#2ecc71,#27ae60);transition:width .25s ease;}',
        '#qzmExportOverlay .qzm-pct{font-size:12px;color:#4e5969;text-align:right;margin-bottom:12px;}',
        '#qzmExportOverlay .qzm-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}',
        '#qzmExportOverlay .qzm-stat{border-radius:10px;padding:10px 8px;text-align:center;background:#f6f8fa;border:1px solid #eef0f2;}',
        '#qzmExportOverlay .qzm-stat-num{font-size:20px;font-weight:700;line-height:1.1;}',
        '#qzmExportOverlay .qzm-stat-label{font-size:11px;color:#8a9099;margin-top:3px;}',
        '#qzmExportOverlay .qzm-stat.is-total .qzm-stat-num{color:#1f2329;}',
        '#qzmExportOverlay .qzm-stat.is-done{background:#eafaf0;border-color:#c7efd3;}',
        '#qzmExportOverlay .qzm-stat.is-done .qzm-stat-num{color:#1e8e52;}',
        '#qzmExportOverlay .qzm-stat.is-failed{background:#fdeeee;border-color:#f8d5d5;}',
        '#qzmExportOverlay .qzm-stat.is-failed .qzm-stat-num{color:#e5484d;}',
        '#qzmExportOverlay .qzm-stat.is-skip{background:#fff7e8;border-color:#f5e2bd;}',
        '#qzmExportOverlay .qzm-stat.is-skip .qzm-stat-num{color:#c8860a;}',
        '#qzmExportOverlay .qzm-log-title{font-size:12px;color:#8a9099;margin:0 0 6px;display:flex;align-items:center;gap:6px;}',
        '#qzmExportOverlay .qzm-log{background:#0d1117;color:#c9d1d9;font-family:Menlo,Consolas,"Courier New",monospace;font-size:12px;line-height:1.65;border-radius:10px;padding:12px 14px;height:190px;overflow:auto;overscroll-behavior:contain;white-space:pre-wrap;word-break:break-all;}',
        '#qzmExportOverlay .qzm-log::-webkit-scrollbar{width:8px;}',
        '#qzmExportOverlay .qzm-log::-webkit-scrollbar-thumb{background:#30363d;border-radius:8px;}',
        '#qzmExportOverlay .qzm-log .lv-info{color:#adbac7;}',
        '#qzmExportOverlay .qzm-log .lv-success{color:#3fb950;font-weight:600;}',
        '#qzmExportOverlay .qzm-log .lv-warn{color:#d29922;}',
        '#qzmExportOverlay .qzm-log .lv-error{color:#f85149;}',
        '#qzmExportOverlay .qzm-log-empty{color:#6e7681;}',
        '#qzmExportOverlay .qzm-foot{padding:14px 22px;border-top:1px solid #eef0f2;display:flex;gap:10px;justify-content:flex-end;align-items:center;background:#fbfcfd;}',
        '#qzmExportOverlay .qzm-btn{border:0;border-radius:9px;padding:9px 18px;font-size:14px;font-weight:500;cursor:pointer;transition:filter .15s,background .15s,box-shadow .15s;}',
        '#qzmExportOverlay .qzm-btn:hover{filter:brightness(.97);}',
        '#qzmExportOverlay .qzm-btn[disabled]{opacity:.55;cursor:not-allowed;filter:none;}',
        '#qzmExportOverlay .qzm-btn-primary{background:#27ae60;color:#fff;box-shadow:0 4px 12px rgba(39,174,96,.3);}',
        '#qzmExportOverlay .qzm-btn-default{background:#eef0f2;color:#1f2329;}',
        '#qzmExportOverlay .qzm-btn-danger{background:#fdeeee;color:#e5484d;}'
    ].join('\n');
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'qzmExportOverlay';
    overlay.innerHTML = [
        '<div class="qzm-card" role="dialog" aria-modal="true" aria-label="导出媒体到本地目录">',
        '  <div class="qzm-head">',
        '    <div class="qzm-head-main">',
        '      <div class="qzm-head-icon">',
        '        <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>',
        '      </div>',
        '      <div>',
        '        <p class="qzm-title">导出媒体到本地目录</p>',
        '        <p class="qzm-subtitle" id="qzmScope">相册照片 / 视频 · 独立于常规备份</p>',
        '      </div>',
        '    </div>',
        '    <button type="button" class="qzm-close" id="qzmCloseBtn" title="关闭">&times;</button>',
        '  </div>',
        '  <div class="qzm-body">',
        '    <p class="qzm-desc">仅导出相册照片 / 视频文件到你选择的本地文件夹，便于统一管理（上传网盘、拷贝硬盘或手机），不含说说日志等文案内容。<br>需要 Chromium 86+ 内核；请保持当前 QQ 空间页面开启，导出期间不要刷新或关闭本页。</p>',
        '    <div class="qzm-progress"><div class="qzm-bar" id="qzmBar"></div></div>',
        '    <div class="qzm-pct" id="qzmPct">0%</div>',
        '    <div class="qzm-stats">',
        '      <div class="qzm-stat is-total"><div class="qzm-stat-num" id="qzmStatTotal">0</div><div class="qzm-stat-label">总计</div></div>',
        '      <div class="qzm-stat is-done"><div class="qzm-stat-num" id="qzmStatDone">0</div><div class="qzm-stat-label">成功</div></div>',
        '      <div class="qzm-stat is-failed"><div class="qzm-stat-num" id="qzmStatFailed">0</div><div class="qzm-stat-label">失败</div></div>',
        '      <div class="qzm-stat is-skip"><div class="qzm-stat-num" id="qzmStatSkip">0</div><div class="qzm-stat-label">跳过</div></div>',
        '    </div>',
        '    <p class="qzm-log-title">运行日志</p>',
        '    <div class="qzm-log" id="qzmLog"></div>',
        '  </div>',
        '  <div class="qzm-foot">',
        '    <button type="button" class="qzm-btn qzm-btn-danger" id="qzmStopBtn" style="display:none;">停止</button>',
        '    <button type="button" class="qzm-btn qzm-btn-default" id="qzmDismissBtn">关闭</button>',
        '    <button type="button" class="qzm-btn qzm-btn-primary" id="qzmPickBtn">选择文件夹并开始导出</button>',
        '  </div>',
        '</div>'
    ].join('');
    document.body.appendChild(overlay);

    // 选择文件夹并开始（用户点击 = 真实手势，showDirectoryPicker 才可用）
    document.getElementById('qzmPickBtn').addEventListener('click', function() {
        API.MediaExport.start();
    });
    document.getElementById('qzmStopBtn').addEventListener('click', function() {
        API.MediaExport.state.running = false;
        API.MediaExport.log('已请求停止，将在当前批次完成后中止。', 'warn');
    });
    document.getElementById('qzmCloseBtn').addEventListener('click', API.MediaExport.close);
    document.getElementById('qzmDismissBtn').addEventListener('click', API.MediaExport.close);
};

API.MediaExport.open = function() {
    const el = document.getElementById('qzmExportOverlay');
    if (el) {
        el.style.display = 'flex';
    }
    // 锁定背景滚动，避免滚轮事件穿透至底层页面
    document.documentElement.classList.add('qzm-no-scroll');
};

API.MediaExport.close = function() {
    if (API.MediaExport.state.running) {
        if (!window.confirm('导出正在进行中，确定要关闭吗？关闭后将中止导出。')) {
            return;
        }
        API.MediaExport.state.running = false;
    }
    const el = document.getElementById('qzmExportOverlay');
    if (el) {
        el.style.display = 'none';
    }
    // 恢复背景滚动
    document.documentElement.classList.remove('qzm-no-scroll');
};

/**
 * 输出日志
 * @param {String} msg 内容
 * @param {String} level info|success|warn|error
 */
API.MediaExport.log = function(msg, level) {
    const $log = $('#qzmLog');
    if (!$log.length) {
        console.info('[媒体导出]', msg);
        return;
    }
    const time = API.Utils.formatDate(Date.now() / 1000, 'hh:mm:ss');
    const $line = $('<div>').addClass('lv-' + (level || 'info')).text('[' + time + '] ' + msg);
    $log.append($line);
    // 控制日志行数
    const children = $log.children();
    if (children.length > 800) {
        children.slice(0, children.length - 800).remove();
    }
    $log.scrollTop($log[0].scrollHeight);
};

/**
 * 刷新进度显示
 */
API.MediaExport.updateProgress = function() {
    const s = API.MediaExport.state.stats;
    const processed = s.done + s.failed + s.skipped;
    const pct = s.total > 0 ? Math.min(100, Math.round(processed / s.total * 100)) : 0;
    $('#qzmBar').css('width', pct + '%');
    $('#qzmPct').text(pct + '%');
    $('#qzmStatTotal').text(s.total);
    $('#qzmStatDone').text(s.done);
    $('#qzmStatFailed').text(s.failed);
    $('#qzmStatSkip').text(s.skipped);
};

/**
 * 设置忙碌状态（切换按钮可用性）
 */
API.MediaExport.setBusy = function(busy) {
    let idleText = '选择文件夹并开始导出';
    if (!busy && API.MediaExport.state.everRun) {
        // 已完成过一次导出，提示可再次导出
        idleText = '重新选择文件夹导出';
    }
    $('#qzmPickBtn').prop('disabled', busy).text(busy ? '正在导出...' : idleText);
    $('#qzmStopBtn').toggle(!!busy);
};

/**
 * 选择目录并开始导出
 */
API.MediaExport.start = async function() {
    if (API.MediaExport.state.running) {
        return;
    }
    if (typeof window.showDirectoryPicker !== 'function') {
        API.MediaExport.log('当前浏览器不支持文件夹选择（需 Chromium 86+ 内核，且必须为 https 页面）。', 'error');
        return;
    }

    let dirHandle;
    try {
        dirHandle = await window.showDirectoryPicker({ id: 'qzone-media-export', mode: 'readwrite' });
    } catch (e) {
        if (e && e.name === 'AbortError') {
            API.MediaExport.log('已取消文件夹选择。', 'warn');
            return;
        }
        API.MediaExport.log('无法打开文件夹选择器：' + ((e && e.message) || e) + '。请确认为 https 页面并直接点击本按钮。', 'error');
        return;
    }

    // 申请读写权限
    try {
        if (dirHandle.requestPermission) {
            const perm = await dirHandle.requestPermission({ mode: 'readwrite' });
            if (perm !== 'granted') {
                API.MediaExport.log('未获得所选目录的写入权限，已取消。', 'error');
                return;
            }
        }
    } catch (e) {
        // 权限查询异常不阻断，尝试继续
        console.warn('查询目录权限异常', e);
    }

    await API.MediaExport.run(dirHandle);
};

/**
 * 执行导出
 * @param {FileSystemDirectoryHandle} dirHandle 用户所选目录
 */
API.MediaExport.run = async function(dirHandle) {
    const state = API.MediaExport.state;
    state.running = true;
    state.stats = { total: 0, done: 0, failed: 0, skipped: 0 };
    API.MediaExport._dirCache = new Map();
    API.MediaExport.setBusy(true);
    API.MediaExport.updateProgress();

    try {
        // 确保鉴权信息就绪
        API.Utils.initUin();
        API.Utils.initGtk();
        API.Utils.getQZoneToken();
        try { API.Photos.getRoute(); } catch (e) { /* ignore */ }

        // 防止复用的采集函数读取到 undefined 的历史数据
        QZone.Photos.Album.OLD_Data = QZone.Photos.Album.OLD_Data || [];
        QZone.Videos.OLD_Data = QZone.Videos.OLD_Data || [];

        const uin = QZone.Common.Target.uin || QZone.Common.Owner.uin || '';
        if (!uin) {
            API.MediaExport.log('未获取到 QQ 号，请确认已在 QQ 空间页面登录后重试。', 'error');
            return;
        }

        // 目标根目录：QQ空间媒体_QQ号
        const rootName = API.Utils.filenameValidate('QQ空间媒体_' + uin);
        const rootDir = await dirHandle.getDirectoryHandle(rootName, { create: true });
        API.MediaExport.log('导出目录：所选文件夹/' + rootName + '/', 'info');

        if (state.options.includePhotos) {
            await API.MediaExport.exportPhotos(rootDir);
        }
        if (state.options.includeVideos && state.running) {
            await API.MediaExport.exportVideos(rootDir);
        }

        const s = state.stats;
        if (!state.running) {
            API.MediaExport.log('已中止。已成功 {0}，失败 {1}，跳过 {2}。'.format(s.done, s.failed, s.skipped), 'warn');
        } else {
            API.MediaExport.log('全部完成！成功 {0}，失败 {1}，跳过 {2}。文件已保存到「{3}」目录。'.format(s.done, s.failed, s.skipped, rootName), 'success');
            try {
                API.Utils.notification('QQ空间导出助手', '媒体导出完成：成功 ' + s.done + '，失败 ' + s.failed + '，跳过 ' + s.skipped);
            } catch (e) { /* ignore */ }
        }
    } catch (e) {
        console.error('媒体导出异常', e);
        API.MediaExport.log('导出异常：' + ((e && e.message) || e), 'error');
    } finally {
        state.running = false;
        state.everRun = true;
        API.MediaExport.setBusy(false);
    }
};

/**
 * 导出相册照片
 * @param {FileSystemDirectoryHandle} rootDir 目标根目录
 */
API.MediaExport.exportPhotos = async function(rootDir) {
    const state = API.MediaExport.state;

    API.MediaExport.log('正在获取相册列表...', 'info');

    // 全部相册（含分类信息）
    let allAlbums = await API.Photos.getAllAlbumList();
    allAlbums = allAlbums || [];

    // 用户选择的相册（为空则全部）
    const selIds = (state.options.albums || []).map(a => String(a.id));
    let albums = allAlbums;
    if (selIds.length) {
        albums = allAlbums.filter(a => selIds.indexOf(String(a.id)) > -1);
    }

    API.MediaExport.log('共 {0} 个相册待导出。'.format(albums.length), 'info');

    // 相册总数（用于相册文件夹命名的序号位数）
    const albumTotalCount = (QZone.Photos.Album.Data && QZone.Photos.Album.Data.length) || albums.length;
    const exifType = QZone_Config.Photos && QZone_Config.Photos.Images && QZone_Config.Photos.Images.exifType;

    for (const album of albums) {
        if (!state.running) {
            break;
        }
        if (album.allowAccess === 0) {
            API.MediaExport.log('相册「{0}」无访问权限，已跳过。'.format(album.name), 'warn');
            continue;
        }

        API.MediaExport.log('正在获取相册「{0}」的照片列表...'.format(album.name), 'info');

        let photos = [];
        try {
            photos = await API.Photos.getAlbumImageAllList(album) || [];
        } catch (e) {
            API.MediaExport.log('相册「{0}」照片列表获取失败：{1}'.format(album.name, (e && e.message) || e), 'error');
            continue;
        }
        album.photoList = photos;

        // 相册文件夹（沿用现有：Albums/分类/相册名）
        const albumFolder = API.Photos.getAlbumFolderPath(album, albumTotalCount);

        // 构建下载任务
        const tasks = [];
        const nameDigits = photos.length.toString().length;
        let parseSkipped = 0;
        for (let idx = 0; idx < photos.length; idx++) {
            const photo = photos[idx];
            try {
                const orderNumber = API.Utils.prefixNumber(idx + 1, nameDigits);

                // 时间归档子目录（默认配置为 File，返回空串，即不再分层）
                const categoryPath = API.Photos.getFileStructureFolderPath(photo);
                const subPath = albumFolder + (categoryPath ? '/' + categoryPath : '');

                let url;
                let filename;
                if (photo.is_video && photo.video_info && photo.video_info.video_url) {
                    // 相册内视频
                    url = photo.video_info.video_url;
                    filename = API.Photos.getImageFileName(photo, orderNumber) + '.mp4';
                } else {
                    url = API.Photos.getDownloadUrl(photo, exifType);
                    filename = API.Photos.getImageFileName(photo, orderNumber) + API.Photos.getPhotoSuffix(photo);
                }

                // 地址无效则跳过当前项，避免中断整体导出
                if (typeof url !== 'string' || !url) {
                    parseSkipped++;
                    continue;
                }
                tasks.push({ subPath: subPath, filename: filename, url: url });
            } catch (e) {
                parseSkipped++;
                console.warn('媒体导出解析照片失败', album && album.name, idx, e);
            }
        }

        if (parseSkipped > 0) {
            state.stats.skipped += parseSkipped;
            API.MediaExport.log('相册「{0}」有 {1} 个文件无有效下载地址，已跳过。'.format(album.name, parseSkipped), 'warn');
        }

        state.stats.total += tasks.length + parseSkipped;
        API.MediaExport.updateProgress();
        API.MediaExport.log('相册「{0}」共 {1} 个文件，开始下载...'.format(album.name, tasks.length), 'info');

        await API.MediaExport.runTasks(rootDir, tasks);
    }
};

/**
 * 导出视频
 * @param {FileSystemDirectoryHandle} rootDir 目标根目录
 */
API.MediaExport.exportVideos = async function(rootDir) {
    const state = API.MediaExport.state;

    API.MediaExport.log('正在获取视频列表...', 'info');

    let videos = [];
    try {
        videos = await API.Videos.getAllList() || [];
    } catch (e) {
        API.MediaExport.log('视频列表获取失败：{0}'.format((e && e.message) || e), 'error');
        return;
    }
    API.MediaExport.log('共 {0} 个视频。'.format(videos.length), 'info');

    const tasks = [];
    let externalSkipped = 0;
    let invalidSkipped = 0;
    const nameDigits = videos.length.toString().length;
    for (let idx = 0; idx < videos.length; idx++) {
        const video = videos[idx];
        try {
            const orderNumber = API.Utils.prefixNumber(idx + 1, nameDigits);

            // 解析下载地址
            video.custom_url = video.url || video.video_url || video.url3;

            // 腾讯视频/外部视频或缺失地址，无法直接下载
            if (video.play_url || !video.custom_url || API.Videos.isExternalVideo(video)) {
                externalSkipped++;
                continue;
            }
            // 地址类型非法则跳过，避免后续处理抛出异常
            if (typeof video.custom_url !== 'string') {
                invalidSkipped++;
                continue;
            }

            // 沿用既有命名与归档规则
            video.custom_filename = API.Videos.getFileName(video.custom_url);
            const filename = API.Videos.getVideoFileName(video, orderNumber);
            const categoryPath = API.Videos.getFileStructureFolderPath(video);
            const subPath = 'Videos/' + (categoryPath ? categoryPath : 'videos');
            tasks.push({ subPath: subPath, filename: filename, url: video.custom_url });

            // 视频封面（可选）
            const cover = video.pre || video.url1 || video.preview_img;
            if (typeof cover === 'string' && cover) {
                const coverName = filename.replace(/\.mp4$/i, '') || API.Utils.newSimpleUid(8, 16);
                tasks.push({ subPath: 'Videos/covers', filename: coverName + '.jpeg', url: cover });
            }
        } catch (e) {
            invalidSkipped++;
            console.warn('媒体导出解析视频失败', idx, e);
        }
    }

    if (externalSkipped > 0) {
        API.MediaExport.log('其中 {0} 个为腾讯视频/外部视频，无法直接下载，已跳过。'.format(externalSkipped), 'warn');
    }
    if (invalidSkipped > 0) {
        API.MediaExport.log('其中 {0} 个视频无有效下载地址，已跳过。'.format(invalidSkipped), 'warn');
    }

    const skippedTotal = externalSkipped + invalidSkipped;
    state.stats.skipped += skippedTotal;
    state.stats.total += tasks.length + skippedTotal;
    API.MediaExport.updateProgress();
    API.MediaExport.log('可下载视频（含封面）共 {0} 个文件，开始下载...'.format(tasks.length), 'info');

    await API.MediaExport.runTasks(rootDir, tasks);
};

/**
 * 分批并发执行下载任务
 * @param {FileSystemDirectoryHandle} rootDir 目标根目录
 * @param {Array} tasks [{ subPath, filename, url }]
 */
API.MediaExport.runTasks = async function(rootDir, tasks) {
    if (!tasks || !tasks.length) {
        return;
    }
    let concurrency = parseInt(QZone_Config.Common && QZone_Config.Common.downloadThread) || 6;
    concurrency = Math.min(Math.max(concurrency, 1), 8);

    const chunks = _.chunk(tasks, concurrency);
    for (let i = 0; i < chunks.length; i++) {
        if (!API.MediaExport.state.running) {
            break;
        }
        await Promise.all(chunks[i].map(t => API.MediaExport.downloadInto(rootDir, t.subPath, t.filename, t.url)));
    }
};

/**
 * 下载单个文件并写入目标目录
 * @param {FileSystemDirectoryHandle} rootDir 目标根目录
 * @param {String} subPath 相对子目录（以 / 分隔）
 * @param {String} filename 文件名
 * @param {String} url 下载地址
 */
API.MediaExport.downloadInto = async function(rootDir, subPath, filename, url) {
    const state = API.MediaExport.state;

    if (!url) {
        state.stats.skipped++;
        API.MediaExport.updateProgress();
        API.MediaExport.log('跳过（无有效下载地址）：{0}'.format(filename), 'warn');
        return;
    }

    filename = API.Utils.filenameValidate(filename);

    try {
        const dir = await API.MediaExport.ensureDir(rootDir, subPath);

        // 已存在则跳过，避免重复下载
        let exists = false;
        try {
            await dir.getFileHandle(filename);
            exists = true;
        } catch (e) {
            exists = false;
        }
        if (exists) {
            state.stats.skipped++;
            API.MediaExport.updateProgress();
            return;
        }

        const downUrl = API.Utils.makeDownloadUrl(url, true);
        // 经后台跨域抓取（内容脚本受 MV3 CORS 限制，无法直接读取跨域响应体）
        const res = await API.MediaExport.fetchBlob(downUrl);
        const blob = API.MediaExport.base64ToBlob(res.base64, res.mime);
        if (!blob || blob.size === 0) {
            throw new Error('下载内容为空');
        }

        await API.MediaExport.writeFile(dir, filename, blob);

        state.stats.done++;
        API.MediaExport.updateProgress();
    } catch (e) {
        state.stats.failed++;
        API.MediaExport.updateProgress();
        API.MediaExport.log('下载失败：{0}（{1}）'.format(filename, (e && e.message) || e), 'error');
    }
};

/**
 * 确保子目录存在，返回其目录句柄（带缓存，避免并发重复创建）
 * @param {FileSystemDirectoryHandle} rootDir 目标根目录
 * @param {String} path 相对子目录
 */
API.MediaExport.ensureDir = function(rootDir, path) {
    const key = path || '';
    if (API.MediaExport._dirCache.has(key)) {
        return API.MediaExport._dirCache.get(key);
    }
    const promise = (async function() {
        let dir = rootDir;
        const parts = key.split('/').filter(Boolean);
        for (const part of parts) {
            const name = API.Utils.filenameValidate(part) || part;
            dir = await dir.getDirectoryHandle(name, { create: true });
        }
        return dir;
    })();
    API.MediaExport._dirCache.set(key, promise);
    return promise;
};

/**
 * 通过后台 service worker 跨域抓取文件
 * @param {String} url 下载地址
 * @returns {Promise<{base64:string, mime:string, size:number}>}
 */
API.MediaExport.fetchBlob = function(url) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({ from: 'content', type: 'download_media', url: url }, function(res) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }
            if (!res || !res.ok) {
                reject(new Error((res && res.error) || '下载失败'));
                return;
            }
            resolve(res);
        });
    });
};

/**
 * base64 转 Blob
 * @param {String} base64 base64 内容
 * @param {String} mime MIME 类型
 */
API.MediaExport.base64ToBlob = function(base64, mime) {
    const binary = atob(base64 || '');
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime || 'application/octet-stream' });
};

/**
 * 写入文件到目录句柄
 * @param {FileSystemDirectoryHandle} dir 目录句柄
 * @param {String} name 文件名
 * @param {Blob} blob 文件内容
 */
API.MediaExport.writeFile = async function(dir, name, blob) {
    const fileHandle = await dir.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    try {
        await writable.write(blob);
    } finally {
        await writable.close();
    }
};
