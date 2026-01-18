// 浏览器下载信息，用于更改文件名
const BrowseDownloads = new Map();
let QZoneDownloadId = 0;

/**
 * 获取当前任务下载数
 */
const getInProgressTask = () => {
    return new Promise(resolve => {
        chrome.downloads.search({
            state: "in_progress"
        }, function(data) {
            resolve(data)
        })
    })
}

/**
 * 浏览器下载
 * @param {object} request
 */
const downloadByBrowser = function(request) {
    return new Promise(async resolve => {
        let dataList = await getInProgressTask();
        // 如果有配置最大并发数，需要查询当前下载任务数，如果等于或大于，则继续等待
        while (request.downloadThread > 0 && dataList.length >= request.downloadThread) {
            // 等待1秒后重新查询当前任务数
            await new Promise(resolve => setTimeout(resolve, 1000));
            dataList = await getInProgressTask();
        }

        // 下载任务
        const task = request.task;

        // 读取配置
        chrome.storage.sync.get({
            Common: {
                refererUrls: [
                    "gtimg.com"
                ]
            }
        }, async function(options) {

            // 是否需要添加引用页
            const isMatch = options.Common.refererUrls.filter(item => task.url.includes(item)).length > 0;

            if (isMatch) {
                // 通过fetch下载视频文件
                try {
                    const response = await fetch(task.url, {
                        credentials: 'include'
                    });
                    const blob = await response.blob();
                    // 使用BLOB链接下载文件
                    task.url = URL.createObjectURL(blob);
                } catch (e) {
                    console.error('通过fetch下载视频错误，将使用浏览器直接下载 bg', task, e);
                }
            }

            // 添加下载任务
            chrome.downloads.download(task, function(downloadId) {
                if (chrome.runtime.lastError) {
                    console.error(`添加任务到浏览器失败，请求参数：${JSON.stringify(request)}，错误信息：${chrome.runtime.lastError}`);
                    // 返回失败标识
                    resolve(0);
                    return;
                }
                BrowseDownloads.set(downloadId, task)
                resolve(downloadId);
            });

        })
    })
}

/**
 * 查询下载项
 * @param {string} state
 */
const getDownloadList = function(options) {
    return new Promise(function(resolve, reject) {
        chrome.downloads.search(options, function(data) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message, options);
                // 返回失败标识
                resolve([]);
                return;
            }
            resolve(data);
        })
    });
}

/**
 * 恢复下载
 * @param {string} downloadId
 */
const resumeDownload = function(downloadId) {
    return new Promise(function(resolve, reject) {
        chrome.downloads.resume(downloadId, function() {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message, downloadId);
                // 返回失败标识
                resolve(0);
                return;
            }
            resolve(downloadId);
        })
    });
}

/**
 * 消息监听器，监听来自其他页面的消息
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.from) {
        case 'content':
            // 消息来源，内容脚本
            switch (request.type) {
                case 'reset':
                    // 重置数据
                    BrowseDownloads.clear();
                    sendResponse(true);
                    break;
                case 'download_browser':
                    // 浏览器下载
                    downloadByBrowser(request).then((downloadId) => {
                        sendResponse(downloadId);
                    });
                    return true; // 保持消息通道打开
                case 'download_list':
                    // 获取下载列表
                    getDownloadList(request.options).then((data) => {
                        sendResponse(data);
                    });
                    return true;
                case 'download_info':
                    // 获取下载信息
                    getDownloadList(request.options).then((data) => {
                        sendResponse(data && data.length > 0 ? data[0] : undefined);
                    });
                    return true;
                case 'download_resume':
                    // 恢复下载
                    resumeDownload(request.downloadId).then((data) => {
                        sendResponse(data);
                    });
                    return true;
                case 'show_export_zip':
                    // 打开下载的ZIP文件
                    chrome.downloads.show(QZoneDownloadId);
                    sendResponse(true);
                    break;
                case 'skipLink':
                    chrome.tabs.create({
                        url: request.url
                    });
                    sendResponse(true);
                    break;
                case 'getMimeType':
                    getMimeType(request.url, request.timeout).then((data) => {
                        sendResponse(data);
                    }).catch((e) => {
                        console.error('文件识别异常，将默认不使用文件后缀！', e);
                        sendResponse('');
                    });
                    return true;
                case 'getMapJson':
                    getMapJson(request.url).then((data) => {
                        sendResponse(data);
                    }).catch((e) => {
                        sendResponse(e);
                    });
                    return true;
                default:
                    console.warn('Background 接收到消息，但未识别类型！', request);
                    sendResponse(null);
                    break;
            }
            break;
        default:
            console.warn('Background 接收到消息，但未识别来源！', request);
            sendResponse(null);
            break;
    }
    return false;
});


/**
 * 下载管理器重命名监听器
 */
chrome.downloads.onDeterminingFilename.addListener(function(item, __suggest) {
    function suggest(filename) {
        __suggest({
            filename: filename
        });
    }
    let filename = item.filename;
    let downloadInfo = BrowseDownloads.get(item.id);
    if (downloadInfo) {
        filename = downloadInfo['filename'];
    }
    if (filename.startsWith('QQ空间备份') && filename.endsWith('.zip')) {
        // 备份文件
        QZoneDownloadId = item.id;
    }
    suggest(filename);
});

// 扩展安装时
chrome.runtime.onInstalled.addListener((details) => {
    console.info('QQ空间导出助手安装中...', details);
    switch (details.reason) {
        // 安装
        case chrome.runtime.OnInstalledReason.INSTALL:
            // 打开官网说明文档
            chrome.tabs.create({
                url: 'https://lvshuncai.com/archives/qzone-export.html'
            });
            break;
        case chrome.runtime.OnInstalledReason.UPDATE:
            switch (details.previousVersion) {
                case '1.0.0':
                case '1.0.1':
                case '1.0.2':
                case '1.0.5':
                    // 重置配置项
                    chrome.storage.sync.clear(function() {
                        console.info('清空配置完成');
                    });
                    break;
                case '1.1.1':
                    // 重置备份数据
                    chrome.storage.local.clear(function() {
                        console.info('重置备份数据完成');
                    });
                    break;
                case '1.1.4':
                    // 打开更新日志
                    chrome.tabs.create({
                        url: 'https://www.lvshuncai.com/archives/qzone-export.html#更新日志'
                    });
                    break;
                case '1.1.5':
                    // 重置配置项
                    chrome.storage.sync.clear(function() {
                        console.info('清空配置完成');
                    });
                    // 重置备份数据
                    chrome.storage.local.clear(function() {
                        console.info('重置备份数据完成');
                    });
                    break;
                default:
                    break;
            }
            break;
        default:
            break;
    }
})

/**
 * 获取文件类型 (使用fetch替代XMLHttpRequest)
 * @param {string} url 文件地址
 * @param {number} timeout 超时秒数
 * @returns 
 */
const getMimeType = function(url, timeout) {
    return new Promise(async function(resolve, reject) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
        
        try {
            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            const contentType = response.headers.get('content-type') || '';
            let suffix = '';
            if (contentType.indexOf('/') > -1) {
                suffix = contentType.split('/')[1].split(';')[0];
            }
            resolve(suffix);
        } catch (e) {
            clearTimeout(timeoutId);
            reject(e);
        }
    });
}

/**
 * 获取GeoJson (使用fetch替代XMLHttpRequest)
 * @param {string} url 文件地址
 * @returns 
 */
const getMapJson = function(url) {
    return new Promise(async function(resolve, reject) {
        try {
            const response = await fetch(url);
            const data = await response.json();
            resolve(data);
        } catch (e) {
            reject(e);
        }
    });
}

// 初始化动态规则
const initDynamicRules = async () => {
    try {
        // 获取现有规则
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const removeRuleIds = existingRules.map(rule => rule.id);
        
        // 添加的规则
        const addRules = [{
            "id": 1,
            "priority": 1,
            "action": {
                "requestHeaders": [{
                    "header": "Referer",
                    "operation": "set",
                    "value": "https://user.qzone.qq.com/"
                }],
                "type": "modifyHeaders"
            },
            "condition": {
                "urlFilter": "gtimg.com",
                "resourceTypes": ["xmlhttprequest"]
            }
        }];
        
        // 更新规则
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: removeRuleIds,
            addRules: addRules
        });
        console.info('动态规则初始化完成');
    } catch (error) {
        console.error('动态规则初始化失败', error);
    }
};

// 初始化
initDynamicRules();
