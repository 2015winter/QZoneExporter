/**
 * 用户个人档模块导出API
 * @author https://lvshuncai.com
 */

/**
 * 初始化用户信息
 */
API.Common.initUserInfo = async() => {

    if (API.Common.isOnlyFileExport()) {
        // 仅文件导出，无需初始化
        console.log('仅文件导出，无需初始化用户信息');
        return;
    }

    // 状态更新器
    const indicator = new StatusIndicator('Init_User_Info_Export');
    indicator.print();

    try {

        // 获取所有的QQ好友
        await API.Common.getUserInfos().then((userInfo) => {
            userInfo = API.Utils.toJson(userInfo, /^_Callback\(/);
            console.info("获取用户信息完成", userInfo);

            if (userInfo.code < 0) {
                // 获取异常
                console.warn('初始化用户信息异常：', userInfo);
            }
            userInfo = userInfo.data || {};

            // 用户信息
            userInfo = userInfo && Object.assign(QZone.Common.Target, userInfo);

            // 添加目标头像下载任务
            API.Common.downloadUserAvatars([QZone.Common.Target, QZone.Common.Owner, userInfo]);

            // 更换用户图片
            userInfo.avatar = API.Common.getUserLogoUrl(userInfo.uin);

            // 是否备份自身空间
            userInfo.isOwner = QZone.Common.Target.uin === QZone.Common.Owner.uin;

        }).catch((error) => {
            console.error("获取用户信息异常", error);
        });
    } catch (error) {
        console.error('初始化用户信息异常', error);
    }

    // 完成
    indicator.complete();
}

/**
 * 其它的导出
 */
API.Common.exportOthers = async() => {

    // 模块总进度更新器
    const indicator = new StatusIndicator('Common_Row_Infos');
    indicator.print();

    try {

        // 初始化用户信息
        await API.Common.initUserInfo();

        // 导出用户信息
        await API.Common.exportUser();

        // 导出用户头像
        await API.Common.exportUserAvatar();

        // 下载助手配置信息
        await API.Common.exportConfigToJson();

        // 保存备份数据
        const backupInfos = await API.Common.saveBackupItems();

        // 导出备份数据到JSON
        await API.Common.exportBackupItemsToJson(backupInfos);

        // 下载文件
        await API.Utils.downloadAllFiles();

    } catch (error) {
        console.error('导出其它信息失败', error);
    }

    // 完成
    indicator.complete();

}

/**
 * 导出用户个人档信息
 */
API.Common.exportUser = async() => {

    if (API.Common.isOnlyFileExport()) {
        // 仅文件导出，无需生成首页文件
        console.log('仅文件导出，无需生成首页文件');
        return;
    }

    // 状态更新器
    const indicator = new StatusIndicator('Init_User_Info_Export_Other');
    indicator.print();

    let userInfo = QZone.Common.Target

    // 添加统计信息到用户信息
    userInfo.messages = QZone.Messages.Data.length;
    userInfo.blogs = QZone.Blogs.Data.length;
    userInfo.diaries = QZone.Diaries.Data.length;
    let photos = [];
    for (const album of QZone.Photos.Album.Data) {
        photos = photos.concat(album.photoList || []);
    }
    userInfo.photos = photos.length;
    userInfo.videos = QZone.Videos.Data.length;
    userInfo.boards = QZone.Boards.Data.total;
    userInfo.favorites = QZone.Favorites.Data.length;
    userInfo.shares = QZone.Shares.Data.length;
    userInfo.friends = QZone.Friends.Data.length;
    userInfo.visitors = QZone.Visitors.Data.total;

    // 是否备份自身空间
    userInfo.isOwner = QZone.Common.Target.uin === QZone.Common.Owner.uin;

    // 根据导出类型导出数据
    await API.Common.exportUserToJson(userInfo);

    // 生成MarkDown
    await API.Common.exportUserToMd(userInfo);

    // 生成HTML
    await API.Common.exportUserToHtml(userInfo);

    // 完成
    indicator.complete();
}

/**
 * 导出个人信息到JSON文件
 * @param {Array} friends 好友列表
 */
API.Common.exportUserToJson = async(jsonObj) => {
    const path = API.Common.getModuleRoot('Common') + '/json';

    // 创建JSON文件夹
    await API.Utils.createFolder(path);

    // 写入JOSN
    await API.Common.writeJsonToJs('userInfo', jsonObj, path + '/user.js').then((fileEntry) => {
        console.info("导出用户个人档信息完成", fileEntry);
    }).catch((error) => {
        console.error("导出用户个人档信息异常", error);
    });
}

/**
 * 导出个人信息到MarkDown文件
 * @param {Array} friends 好友列表
 */
API.Common.exportUserToMd = async(userInfo) => {
    // 导出类型存在MarkDown的时候才生成首页MarkDown
    // 说说
    let hasMd = QZone_Config.Messages.exportType === 'MarkDown';
    // 日志
    hasMd = hasMd || QZone_Config.Blogs.exportType === 'MarkDown';
    // 日记
    hasMd = hasMd || QZone_Config.Diaries.exportType === 'MarkDown';
    // 留言
    hasMd = hasMd || QZone_Config.Boards.exportType === 'MarkDown';
    // 好友
    hasMd = hasMd || QZone_Config.Friends.exportType === 'MarkDown';
    // 收藏
    hasMd = hasMd || QZone_Config.Favorites.exportType === 'MarkDown';
    // 分享
    hasMd = hasMd || QZone_Config.Shares.exportType === 'MarkDown';
    // 访客
    hasMd = hasMd || QZone_Config.Visitors.exportType === 'MarkDown';
    // 相册
    hasMd = hasMd || QZone_Config.Photos.exportType === 'MarkDown';
    // 视频
    hasMd = hasMd || QZone_Config.Videos.exportType === 'MarkDown';

    if (!hasMd) {
        return;
    }

    console.info('导出空间预览到Markdown文件开始', userInfo);

    const contents = [];
    contents.push('### 个人信息');
    contents.push('{nickname}({uin})'.format(QZone.Common.Target));

    contents.push('### 空间名称');
    contents.push('{spacename}'.format(QZone.Common.Target));

    contents.push('### 空间说明');
    contents.push('{desc}'.format(QZone.Common.Target));

    contents.push('### 空间概览');
    contents.push('说说|日志|日记|相册|视频|留言|收藏|分享|访客|好友');
    contents.push('---|---|---|---|---|---|---|---');
    contents.push('{messages}|{blogs}|{diaries}|{photos}|{videos}|{boards}|{favorites}|{shares}|{visitors}|{friends}'.format(QZone.Common.Target));

    await API.Utils.writeText(contents.join('\r\n'), API.Common.getRootFolder() + "/index.md").then((fileEntry) => {
        console.info("导出空间预览到Markdown文件完成", fileEntry, userInfo);
    }).catch((error) => {
        console.error("导出空间预览到Markdown文件异常", error, userInfo);
    });
}

/**
 * 导出个人信息到HTML文件
 * @param {Array} friends 好友列表
 */
API.Common.exportUserToHtml = async(userInfo) => {
    // 导出类型存在HTML的时候才生成首页HTML
    // 说说
    let hasHtml = QZone_Config.Messages.exportType === 'HTML';
    // 日志
    hasHtml = hasHtml || QZone_Config.Blogs.exportType === 'HTML';
    // 日记
    hasHtml = hasHtml || QZone_Config.Diaries.exportType === 'HTML';
    // 留言
    hasHtml = hasHtml || QZone_Config.Boards.exportType === 'HTML';
    // 好友
    hasHtml = hasHtml || QZone_Config.Friends.exportType === 'HTML';
    // 收藏
    hasHtml = hasHtml || QZone_Config.Favorites.exportType === 'HTML';
    // 分享
    hasHtml = hasHtml || QZone_Config.Shares.exportType === 'HTML';
    // 访客
    hasHtml = hasHtml || QZone_Config.Visitors.exportType === 'HTML';
    // 相册
    hasHtml = hasHtml || QZone_Config.Photos.exportType === 'HTML';
    // 视频
    hasHtml = hasHtml || QZone_Config.Videos.exportType === 'HTML';

    if (!hasHtml) {
        return;
    }

    // 导出HTML依赖的JS、CSS - 并行下载优化
    const downloadTasks = QZone.Common.ExportFiles.map(pathInfo => {
        return async () => {
            let paths = (API.Common.getRootFolder() + '/' + pathInfo.target).split('/');
            let filename = paths.pop();
            await API.Utils.createFolder(paths.join('/'));
            await API.Utils.downloadToFile(chrome.runtime.getURL(pathInfo.original), paths.join('/') + '/' + filename);
        };
    });
    
    // 使用并发限制器，同时下载5个文件
    await API.Utils.parallelLimit(downloadTasks, task => task(), 5);

    console.info('生成首页HTML文件开始', userInfo);
    // 基于模板生成HTML
    let fileEntry = await API.Common.writeHtmlofTpl('index', { user: userInfo }, API.Common.getRootFolder() + "/index.html");
    console.info('生成首页HTML文件结束', fileEntry, userInfo);
}

/**
 * 基于模板生成HTML文件
 * @param {string} name 模板文件名
 * @param {object} params 参数
 * @param {object} params 参数
 */
API.Common.writeHtmlofTpl = async(name, params, indexHtmlePath) => {
    let html = await API.Common.getHtmlTemplate(name, params);
    let fileEntry = await API.Utils.writeText(html, indexHtmlePath);
    return fileEntry;
}

/**
 * 纯解析式模板引擎（完全不使用eval/Function，兼容严格CSP）
 * @param {string} tpl 模板字符串
 * @param {object} data 数据对象
 * @returns {string} 渲染后的HTML
 */
API.Common.safeTemplateRender = (tpl, data) => {
    // 解析器状态
    const context = Object.assign({}, data);
    
    // HTML转义
    const escapeHtml = (str) => {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };
    
    // 从路径获取值，支持 a.b.c 和 a[0].b 和 a[var] 格式
    const getValueByPath = (path, ctx) => {
        if (!path || !ctx) return undefined;
        path = path.trim();
        
        // 处理字符串字面量
        if ((path.startsWith('"') && path.endsWith('"')) || (path.startsWith("'") && path.endsWith("'"))) {
            return path.slice(1, -1);
        }
        // 处理数字
        if (/^-?\d+(\.\d+)?$/.test(path)) {
            return parseFloat(path);
        }
        // 处理布尔值和特殊值
        if (path === 'true') return true;
        if (path === 'false') return false;
        if (path === 'null') return null;
        if (path === 'undefined') return undefined;
        
        // 分割路径，处理 a.b[c].d 格式
        const parts = [];
        let current = '';
        let inBracket = false;
        let bracketContent = '';
        
        for (let i = 0; i < path.length; i++) {
            const char = path[i];
            if (inBracket) {
                if (char === ']') {
                    parts.push({ type: 'index', value: bracketContent });
                    bracketContent = '';
                    inBracket = false;
                } else {
                    bracketContent += char;
                }
            } else if (char === '[') {
                if (current) {
                    parts.push({ type: 'prop', value: current });
                    current = '';
                }
                inBracket = true;
            } else if (char === '.') {
                if (current) {
                    parts.push({ type: 'prop', value: current });
                    current = '';
                }
            } else {
                current += char;
            }
        }
        if (current) parts.push({ type: 'prop', value: current });
        
        // 遍历路径获取值
        let value = ctx;
        for (const part of parts) {
            if (value === null || value === undefined) return undefined;
            if (part.type === 'index') {
                // 索引可能是变量或数字
                let idx = part.value.trim();
                if (/^\d+$/.test(idx)) {
                    idx = parseInt(idx);
                } else {
                    // 变量索引，从上下文获取
                    idx = getValueByPath(idx, ctx);
                }
                value = value[idx];
            } else {
                value = value[part.value];
            }
        }
        return value;
    };
    
    // 设置值到路径
    const setValueByPath = (path, value, ctx) => {
        const parts = path.trim().split('.');
        let obj = ctx;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) obj[parts[i]] = {};
            obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;
    };
    
    // 在表达式中找操作符（排除括号和字符串内的）
    const findOperator = (str, op) => {
        let depth = 0;
        let inString = false;
        let stringChar = '';
        for (let i = 0; i < str.length - op.length + 1; i++) {
            const char = str[i];
            if (inString) {
                if (char === stringChar && str[i-1] !== '\\') inString = false;
            } else if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
            } else if (char === '(' || char === '[' || char === '{') {
                depth++;
            } else if (char === ')' || char === ']' || char === '}') {
                depth--;
            } else if (depth === 0 && str.substring(i, i + op.length) === op) {
                return i;
            }
        }
        return -1;
    };
    
    // 解析函数调用参数
    const parseArgs = (argsStr, ctx) => {
        if (!argsStr || !argsStr.trim()) return [];
        const args = [];
        let current = '';
        let depth = 0;
        let inString = false;
        let stringChar = '';
        
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr[i];
            if (inString) {
                current += char;
                if (char === stringChar && argsStr[i-1] !== '\\') inString = false;
            } else if (char === '"' || char === "'") {
                inString = true;
                stringChar = char;
                current += char;
            } else if (char === '(' || char === '[' || char === '{') {
                depth++;
                current += char;
            } else if (char === ')' || char === ']' || char === '}') {
                depth--;
                current += char;
            } else if (char === ',' && depth === 0) {
                args.push(evaluateExpr(current.trim(), ctx));
                current = '';
            } else {
                current += char;
            }
        }
        if (current.trim()) {
            args.push(evaluateExpr(current.trim(), ctx));
        }
        return args;
    };
    
    // 求值表达式
    const evaluateExpr = (expr, ctx) => {
        if (!expr) return undefined;
        expr = expr.trim();

        // 去掉最外层包裹括号，例如：(a || b) -> a || b
        // 这在模板里常见：<%:=(a || b)%>；如果不处理，会因为操作符查找跳过括号导致被当成“路径”取值。
        const stripOuterParens = (s) => {
            s = (s || '').trim();
            if (!s.startsWith('(') || !s.endsWith(')')) return s;

            let depth = 0;
            let inString = false;
            let stringChar = '';

            for (let i = 0; i < s.length; i++) {
                const ch = s[i];
                if (inString) {
                    if (ch === stringChar && (i === 0 || s[i - 1] !== '\\')) inString = false;
                    continue;
                }

                if (ch === '"' || ch === "'") {
                    inString = true;
                    stringChar = ch;
                    continue;
                }

                if (ch === '(') {
                    depth++;
                    continue;
                }

                if (ch === ')') {
                    depth--;
                    // 最外层括号在末尾之前就闭合，说明不是完整包裹
                    if (depth === 0 && i < s.length - 1) return s;
                }
            }

            if (depth !== 0) return s;
            return s.slice(1, -1).trim();
        };

        // 可能有多层括号包裹
        for (let i = 0; i < 5; i++) {
            const next = stripOuterParens(expr);
            if (next === expr) break;
            expr = next;
        }
        
        // 字符串字面量
        if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
            return expr.slice(1, -1);
        }
        // 数字
        if (/^-?\d+(\.\d+)?$/.test(expr)) {
            return parseFloat(expr);
        }
        // 布尔值
        if (expr === 'true') return true;
        if (expr === 'false') return false;
        if (expr === 'null') return null;
        if (expr === 'undefined') return undefined;
        
        // 处理三元运算符 a ? b : c
        const ternaryIdx = findOperator(expr, '?');
        if (ternaryIdx !== -1) {
            const colonIdx = findOperator(expr.substring(ternaryIdx + 1), ':');
            if (colonIdx !== -1) {
                const condition = evaluateExpr(expr.substring(0, ternaryIdx), ctx);
                const trueExpr = expr.substring(ternaryIdx + 1, ternaryIdx + 1 + colonIdx);
                const falseExpr = expr.substring(ternaryIdx + 1 + colonIdx + 1);
                return condition ? evaluateExpr(trueExpr, ctx) : evaluateExpr(falseExpr, ctx);
            }
        }
        
        // 处理 || 运算符
        const orIdx = findOperator(expr, '||');
        if (orIdx !== -1) {
            const left = evaluateExpr(expr.substring(0, orIdx), ctx);
            return left || evaluateExpr(expr.substring(orIdx + 2), ctx);
        }
        
        // 处理 && 运算符
        const andIdx = findOperator(expr, '&&');
        if (andIdx !== -1) {
            const left = evaluateExpr(expr.substring(0, andIdx), ctx);
            return left && evaluateExpr(expr.substring(andIdx + 2), ctx);
        }
        
        // 处理比较运算符
        const compOps = ['===', '!==', '==', '!=', '>=', '<=', '>', '<'];
        for (const op of compOps) {
            const idx = findOperator(expr, op);
            if (idx !== -1) {
                const left = evaluateExpr(expr.substring(0, idx), ctx);
                const right = evaluateExpr(expr.substring(idx + op.length), ctx);
                switch (op) {
                    case '===': return left === right;
                    case '!==': return left !== right;
                    case '==': return left == right;
                    case '!=': return left != right;
                    case '>=': return left >= right;
                    case '<=': return left <= right;
                    case '>': return left > right;
                    case '<': return left < right;
                }
            }
        }
        
        // 处理 + 运算符
        const plusIdx = findOperator(expr, '+');
        if (plusIdx !== -1 && plusIdx > 0) {
            const left = evaluateExpr(expr.substring(0, plusIdx), ctx);
            const right = evaluateExpr(expr.substring(plusIdx + 1), ctx);
            return left + right;
        }
        
        // 处理 - 运算符（非负号）
        const minusIdx = findOperator(expr, '-');
        if (minusIdx !== -1 && minusIdx > 0) {
            const left = evaluateExpr(expr.substring(0, minusIdx), ctx);
            const right = evaluateExpr(expr.substring(minusIdx + 1), ctx);
            return left - right;
        }
        
        // 处理 ! 否定运算符
        if (expr.startsWith('!')) {
            return !evaluateExpr(expr.substring(1), ctx);
        }
        
        // 处理函数调用（包括调用后的属性访问，如 func(x).prop）
        // 找到第一个函数调用
        const firstParen = expr.indexOf('(');
        if (firstParen > 0) {
            // 找到匹配的闭括号
            let depth = 1;
            let closeParen = -1;
            for (let i = firstParen + 1; i < expr.length; i++) {
                if (expr[i] === '(') depth++;
                else if (expr[i] === ')') {
                    depth--;
                    if (depth === 0) {
                        closeParen = i;
                        break;
                    }
                }
            }
            
            if (closeParen !== -1) {
                const funcPath = expr.substring(0, firstParen).trim();
                const argsStr = expr.substring(firstParen + 1, closeParen);
                const remaining = expr.substring(closeParen + 1).trim(); // 函数调用后的部分，如 .uin
                
                let result;
                
                // 方法调用
                const lastDot = funcPath.lastIndexOf('.');
                if (lastDot !== -1) {
                    const objPath = funcPath.substring(0, lastDot);
                    const methodName = funcPath.substring(lastDot + 1);
                    const obj = getValueByPath(objPath, ctx);
                    if (obj && typeof obj[methodName] === 'function') {
                        const args = parseArgs(argsStr, ctx);
                        result = obj[methodName].apply(obj, args);
                    }
                }
                
                // 直接函数调用
                if (result === undefined) {
                    const func = getValueByPath(funcPath, ctx);
                    if (typeof func === 'function') {
                        const args = parseArgs(argsStr, ctx);
                        result = func.apply(null, args);
                    }
                }
                
                // 处理函数调用后的属性访问，如 .uin 或 .name
                if (result !== undefined && remaining) {
                    if (remaining.startsWith('.')) {
                        const propPath = remaining.substring(1);
                        // 简单属性访问链，如 .uin 或 .uin.sub
                        const props = propPath.split('.');
                        let value = result;
                        for (const prop of props) {
                            if (value === null || value === undefined) break;
                            // 处理可能的方法调用
                            if (prop.includes('(')) {
                                const methodMatch = prop.match(/^(\w+)\((.*)\)$/);
                                if (methodMatch && typeof value[methodMatch[1]] === 'function') {
                                    const args = parseArgs(methodMatch[2], ctx);
                                    value = value[methodMatch[1]].apply(value, args);
                                }
                            } else {
                                value = value[prop];
                            }
                        }
                        return value;
                    }
                }
                
                if (result !== undefined) {
                    return result;
                }
            }
        }
        
        // 处理属性访问
        return getValueByPath(expr, ctx);
    };
    
    // 找到匹配的结束标签（处理嵌套）
    const findMatchingEnd = (template, startIdx) => {
        let depth = 1;
        let i = startIdx;
        let bodyEndTag = -1;
        
        while (i < template.length && depth > 0) {
            const nextTag = template.indexOf('<%', i);
            if (nextTag === -1) break;
            const nextTagEnd = template.indexOf('%>', nextTag);
            if (nextTagEnd === -1) break;
            const content = template.substring(nextTag + 2, nextTagEnd).trim();
            
            // 检查是否是新的块开始
            if (content.startsWith('for') || content.startsWith('if')) {
                depth++;
            } 
            // 只有单独的 } 才是块结束，}else{ 或 }else if 不是
            else if (content === '}') {
                depth--;
                if (depth === 0) {
                    bodyEndTag = nextTag;
                }
            }
            // }else{ 和 }else if 不改变深度，只是分支切换
            // 但如果是嵌套的，需要处理
            else if (content.startsWith('}') && !content.includes('else') && depth > 1) {
                depth--;
            }
            
            i = nextTagEnd + 2;
        }
        
        return { bodyEndTag, endIndex: i };
    };
    
    // 解析 for 循环
    const parseForLoop = (template, startIdx, ctx) => {
        const tagEnd = template.indexOf('%>', startIdx);
        const tagContent = template.substring(startIdx + 2, tagEnd).trim();
        const bodyStart = tagEnd + 2;
        
        // 找到循环体的结束
        const { bodyEndTag, endIndex } = findMatchingEnd(template, bodyStart);
        const body = template.substring(bodyStart, bodyEndTag);
        
        let result = '';
        
        // for (const [key, value] of map)
        const mapMatch = tagContent.match(/for\s*\(\s*(?:const|let|var)?\s*\[(\w+),\s*(\w+)\]\s+of\s+(.+?)\s*\)\s*\{?$/);
        if (mapMatch) {
            const keyName = mapMatch[1];
            const valueName = mapMatch[2];
            const mapExpr = mapMatch[3];
            const map = evaluateExpr(mapExpr, ctx);
            if (map) {
                const entries = map instanceof Map ? Array.from(map.entries()) : Object.entries(map);
                for (const [key, value] of entries) {
                    const loopCtx = Object.assign({}, ctx);
                    loopCtx[keyName] = key;
                    loopCtx[valueName] = value;
                    result += parseTemplate(body, loopCtx);
                }
            }
            return { content: result, endIndex };
        }
        
        // for (const item of array)
        const ofMatch = tagContent.match(/for\s*\(\s*(?:const|let|var)?\s*(\w+)\s+of\s+(.+?)\s*\)\s*\{?$/);
        if (ofMatch) {
            const itemName = ofMatch[1];
            const arrayExpr = ofMatch[2];
            const array = evaluateExpr(arrayExpr, ctx);
            if (Array.isArray(array)) {
                for (const item of array) {
                    const loopCtx = Object.assign({}, ctx);
                    loopCtx[itemName] = item;
                    result += parseTemplate(body, loopCtx);
                }
            }
            return { content: result, endIndex };
        }
        
        // for (let i = 0; i < n; i++)
        const tradMatch = tagContent.match(/for\s*\(\s*(?:let|var)?\s*(\w+)\s*=\s*(\d+)\s*;\s*\1\s*<\s*(.+?)\s*;\s*\1\+\+\s*\)\s*\{?$/);
        if (tradMatch) {
            const varName = tradMatch[1];
            const startVal = parseInt(tradMatch[2]);
            const endExpr = tradMatch[3];
            const endVal = evaluateExpr(endExpr, ctx);
            for (let j = startVal; j < endVal; j++) {
                const loopCtx = Object.assign({}, ctx);
                loopCtx[varName] = j;
                result += parseTemplate(body, loopCtx);
            }
            return { content: result, endIndex };
        }
        
        return { content: '', endIndex };
    };
    
    // 解析 if 语句（包括 else if 和 else）
    const parseIfStatement = (template, startIdx, ctx) => {
        const tagEnd = template.indexOf('%>', startIdx);
        const tagContent = template.substring(startIdx + 2, tagEnd).trim();
        
        // 收集所有分支
        let depth = 1;
        let i = tagEnd + 2;
        let branches = [];
        let currentBranchStart = i;
        let currentCondition = tagContent.match(/if\s*\((.+)\)\s*\{?$/)?.[1];
        
        while (i < template.length && depth > 0) {
            const nextTag = template.indexOf('<%', i);
            if (nextTag === -1) break;
            const nextTagEnd = template.indexOf('%>', nextTag);
            if (nextTagEnd === -1) break;
            const content = template.substring(nextTag + 2, nextTagEnd).trim();
            
            if (content.startsWith('for') || content.startsWith('if')) {
                depth++;
            } else if (content === '}' && depth === 1) {
                // if 块结束
                branches.push({
                    condition: currentCondition,
                    body: template.substring(currentBranchStart, nextTag)
                });
                depth--;
            } else if (content === '}' && depth > 1) {
                depth--;
            } else if (depth === 1 && content.match(/^\}?\s*else\s*if\s*\((.+)\)\s*\{?$/)) {
                // else if 分支
                branches.push({
                    condition: currentCondition,
                    body: template.substring(currentBranchStart, nextTag)
                });
                currentCondition = content.match(/^\}?\s*else\s*if\s*\((.+)\)\s*\{?$/)[1];
                currentBranchStart = nextTagEnd + 2;
            } else if (depth === 1 && content.match(/^\}?\s*else\s*\{?$/)) {
                // else 分支
                branches.push({
                    condition: currentCondition,
                    body: template.substring(currentBranchStart, nextTag)
                });
                currentCondition = null; // else 无条件
                currentBranchStart = nextTagEnd + 2;
            }
            i = nextTagEnd + 2;
        }
        
        // 执行分支
        for (const branch of branches) {
            if (branch.condition === null) {
                // else 分支，无条件执行
                return { content: parseTemplate(branch.body, ctx), endIndex: i };
            }
            const condValue = evaluateExpr(branch.condition, ctx);
            if (condValue) {
                return { content: parseTemplate(branch.body, ctx), endIndex: i };
            }
        }
        
        return { content: '', endIndex: i };
    };
    
    // 解析赋值语句
    const parseAssignment = (stmt, ctx) => {
        stmt = stmt.trim();
        // 去掉 const/let/var
        if (stmt.startsWith('const ')) stmt = stmt.substring(6);
        else if (stmt.startsWith('let ')) stmt = stmt.substring(4);
        else if (stmt.startsWith('var ')) stmt = stmt.substring(4);
        
        const eqIdx = stmt.indexOf('=');
        if (eqIdx !== -1 && stmt[eqIdx + 1] !== '=') { // 排除 == 和 ===
            const varName = stmt.substring(0, eqIdx).trim();
            const valueExpr = stmt.substring(eqIdx + 1).trim();
            const value = evaluateExpr(valueExpr, ctx);
            setValueByPath(varName, value, ctx);
        }
    };
    
    // 主解析函数
    const parseTemplate = (template, ctx) => {
        let result = '';
        let i = 0;
        
        while (i < template.length) {
            const tagStart = template.indexOf('<%', i);
            
            if (tagStart === -1) {
                result += template.substring(i);
                break;
            }
            
            // 添加标签前的文本
            result += template.substring(i, tagStart);
            
            const tagEnd = template.indexOf('%>', tagStart);
            if (tagEnd === -1) {
                result += template.substring(tagStart);
                break;
            }
            
            const tagContent = template.substring(tagStart + 2, tagEnd).trim();
            i = tagEnd + 2;
            
            // 输出标签 <%:=expr%> 或 <%:h=expr%>
            if (tagContent.startsWith(':=')) {
                let value = evaluateExpr(tagContent.substring(2).trim(), ctx);
                if (value === undefined || value === null) value = '';
                result += value;
            } else if (tagContent.startsWith(':h=')) {
                let value = evaluateExpr(tagContent.substring(3).trim(), ctx);
                result += escapeHtml(value);
            }
            // 注释
            else if (tagContent.startsWith('/*')) {
                // 忽略注释
            }
            // for 循环
            else if (tagContent.startsWith('for')) {
                const forResult = parseForLoop(template, tagStart, ctx);
                result += forResult.content;
                i = forResult.endIndex;
            }
            // if 语句
            else if (tagContent.startsWith('if')) {
                const ifResult = parseIfStatement(template, tagStart, ctx);
                result += ifResult.content;
                i = ifResult.endIndex;
            }
            // 变量声明/赋值
            else if (tagContent.startsWith('const ') || tagContent.startsWith('let ') || tagContent.startsWith('var ')) {
                parseAssignment(tagContent, ctx);
            }
            // 赋值（带 = 但不是比较）
            else if (tagContent.includes('=') && !tagContent.includes('==') && !tagContent.startsWith('if') && !tagContent.startsWith('for')) {
                parseAssignment(tagContent, ctx);
            }
            // 自增
            else if (tagContent.endsWith('++')) {
                const varName = tagContent.slice(0, -2).trim();
                const val = getValueByPath(varName, ctx);
                setValueByPath(varName, (val || 0) + 1, ctx);
            }
            // 自减
            else if (tagContent.endsWith('--')) {
                const varName = tagContent.slice(0, -2).trim();
                const val = getValueByPath(varName, ctx);
                setValueByPath(varName, (val || 0) - 1, ctx);
            }
            // 单独的 } 或其他控制标签，在这里忽略（由 for/if 解析器处理）
        }
        
        return result;
    };
    
    try {
        return parseTemplate(tpl, context);
    } catch (error) {
        console.error('模板解析错误:', error);
        console.error('错误位置附近:', tpl.substring(0, 500));
        throw error;
    }
};

/**
 * 渲染HTML模板
 * @param {string} name 模板文件名
 * @param {object} params 参数
 */
API.Common.getHtmlTemplate = async(name, params) => {
    let html = await API.Utils.get(chrome.runtime.getURL('templates/' + name + '.html'));
    
    // 将API对象和其他全局变量注入到模板参数中
    const templateParams = Object.assign({}, params || {}, {
        API: API,
        QZone: QZone,
        QZone_Config: QZone_Config,
        _: _
    });
    
    try {
        // 优先使用安全的模板渲染（不依赖eval，兼容CSP）
        const result = API.Common.safeTemplateRender(html, templateParams);
        return result;
    } catch (error) {
        console.error('安全模板渲染失败，尝试使用template.js', name, error);
        
        // 回退到template.js（可能因CSP限制而失败）
        try {
            const result = template(html, templateParams);
            if (result === 'template.js error' || (typeof result === 'string' && result.includes('template.js error'))) {
                throw new Error('template.js渲染失败');
            }
            return result;
        } catch (e) {
            console.error('模板渲染完全失败', name, e);
            return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>模板错误</title></head><body>' +
                   '<h1>模板渲染错误: ' + name + '</h1>' +
                   '<p>错误: ' + (error.message || error) + '</p>' +
                   '</body></html>';
        }
    }
}

/**
 * 基于JSON生成JS文件
 * @param {string} key js变量名
 * @param {object} object 对象
 * @param {string} path js文件路径
 */
API.Common.writeJsonToJs = async(key, object, path) => {
    const json = JSON.stringify(object);
    const js = 'window.' + key + ' = ' + json;
    return await API.Utils.writeText(js, path);
}

/**
 * 转换内容
 * @param {string} contet 内容
 * @param {string} type 转换类型，默认TEXT,可选HTML,MD
 * @param {boolean} isRt 是否是处理转发内容
 * @param {boolean} isSupportedHtml 内容本身是否支持HTML
 * @param {boolean} isEscHTML 是否全部转换HTML标签
 * @param {boolean} isDownloadEmoticon 是否下载表情
 * @param {boolean} isFormatEmoticonPath 是否转换本地地址
 */
API.Common.formatContent = (item, type, isRt, isSupportedHtml, isEscHTML, isDownloadEmoticon, isFormatEmoticonPath) => {
    // 默认调用原先的内容转换
    return API.Utils.formatContent(item, type, isRt, isSupportedHtml, isEscHTML, isDownloadEmoticon, isFormatEmoticonPath);
}

/**
 * 通过Ajax请求下载文件
 * @param {Array} tasks
 */
API.Common.downloadsByAjax = async(tasks) => {

    // 任务分组
    const _tasks = _.chunk(tasks, 10);

    const indicator = new StatusIndicator('Common_File');
    indicator.setTotal(tasks.length);

    for (let i = 0; i < _tasks.length; i++) {
        const list = _tasks[i];
        let down_tasks = [];
        for (let j = 0; j < list.length; j++) {
            const task = list[j];

            // 创建文件夹
            const folderName = API.Common.getRootFolder() + '/' + task.dir;
            await API.Utils.createFolder(folderName);

            const filepath = folderName + '/' + task.name;
            down_tasks.push(API.Utils.downloadToFile(task.url, filepath).then(() => {
                task.setState('complete');
                indicator.addSuccess(task);
            }).catch((error) => {
                indicator.addFailed(task);
                task.setState('interrupted');
                console.error('下载文件异常', task, error);
            }));
        }
        await Promise.all(down_tasks);
    }
    indicator.complete();
    return true;
}

/**
 * 通过浏览器下载文件
 * @param {BrowserTask} tasks 浏览器下载任务
 */
API.Common.downloadsByBrowser = async(tasks) => {
    // 进度器
    let indicator = new StatusIndicator('Common_Browser');
    indicator.setTotal(tasks.length);

    // 开始下载
    const _tasks = _.chunk(tasks, QZone_Config.Common.downloadThread);
    for (let i = 0; i < _tasks.length; i++) {
        const list = _tasks[i];
        for (let j = 0; j < list.length; j++) {
            const task = list[j];
            // 添加任务到下载器的时候，可能存在一直无返回的情况，问题暂未定位，先临时添加超时秒数逻辑
            await API.Utils.timeoutPromise(API.Utils.downloadByBrowser(task), 60 * 1000 * 5).then((downloadTask) => {
                if (downloadTask.id > 0) {
                    task.setState('complete');
                    indicator.addSuccess(task);
                } else {
                    console.error('添加到浏览器下载异常', task);
                    task.setState('interrupted');
                    indicator.addFailed(task);
                }
            }).catch((error) => {
                console.error('添加到浏览器下载异常', error, task);
                task.setState('interrupted');
                indicator.addFailed(task);
            })
        }
        // 等待1秒再继续添加
        await API.Utils.sleep(QZone_Config.Common.downloadSleep || 1000);
    }
    indicator.complete();
    return true;
}

/**
 * 通过Aria2下载文件
 * @param {Array} tasks
 */
API.Common.downloadByAria2 = async(tasks) => {
    // 进度更新器
    const indicator = new StatusIndicator('Common_Aria2');
    indicator.setTotal(tasks.length);

    // 获取Aria2配置
    const aria2Config = QZone_Config.Common.Aria2;
    const enableQueueControl = aria2Config.enableQueueControl !== false; // 默认启用
    const maxWaiting = aria2Config.maxWaiting || 100;
    const checkInterval = (aria2Config.checkInterval || 3) * 1000;
    const autoCleanStuck = aria2Config.autoCleanStuck !== false; // 默认启用
    const stuckCheckInterval = aria2Config.stuckCheckInterval || 5;

    // 预先过滤不支持的URL格式
    const supportedTasks = [];
    const unsupportedTasks = [];
    
    for (const task of tasks) {
        const checkResult = API.Utils.isUrlSupportedByAria2(task.url);
        if (checkResult.supported) {
            supportedTasks.push(task);
        } else {
            unsupportedTasks.push({
                task: task,
                reason: checkResult.reason
            });
            task.setState('skipped');
            task.skipReason = checkResult.reason;
            console.warn(`[Aria2] 跳过不支持的URL格式: ${task.url}, 原因: ${checkResult.reason}`);
        }
    }
    
    // 更新跳过的不支持格式数量
    if (unsupportedTasks.length > 0) {
        indicator.setSkipUnsupported(unsupportedTasks.length);
        console.log(`[Aria2] 跳过 ${unsupportedTasks.length} 个不支持格式的下载任务`);
    }

    // 开始下载支持的任务
    const _tasks = _.chunk(supportedTasks, QZone_Config.Common.downloadThread);
    let batchCount = 0;
    
    for (let i = 0; i < _tasks.length; i++) {
        const list = _tasks[i];
        
        // 如果启用队列控制，在添加每批任务前检查Aria2队列状态
        if (enableQueueControl) {
            await API.Utils.waitForAria2QueueSlot(maxWaiting, checkInterval);
        }
        
        for (let j = 0; j < list.length; j++) {
            const task = list[j];
            await API.Utils.downloadByAria2(task).then((result) => {
                if (result.error) {
                    console.error('添加到Aria2异常', result, task);
                    task.setState('interrupted');
                    indicator.addFailed(task);
                } else {
                    task.setState('complete');
                    // 添加成功
                    indicator.addSuccess(task);
                }
            }).catch((error) => {
                console.error('添加到Aria2异常', error, task);
                task.setState('interrupted');
                indicator.addFailed(task);
            })
        }
        
        // 定期清理卡住的任务
        batchCount++;
        if (autoCleanStuck && batchCount >= stuckCheckInterval) {
            batchCount = 0;
            try {
                const removedCount = await API.Utils.removeStuckAria2Tasks();
                if (removedCount > 0) {
                    console.log(`[Aria2] 自动清理了 ${removedCount} 个卡住的下载任务`);
                }
            } catch (e) {
                console.warn('清理卡住任务时发生错误', e);
            }
        }
        
        // 等待指定秒数再继续添加
        await API.Utils.sleep((QZone_Config.Common.downloadSleep || 1) * 1000);
    }
    
    // 最后再清理一次卡住的任务
    if (autoCleanStuck) {
        try {
            await API.Utils.sleep(3000); // 等待3秒让最后一批任务开始
            const removedCount = await API.Utils.removeStuckAria2Tasks();
            if (removedCount > 0) {
                console.log(`[Aria2] 最终清理了 ${removedCount} 个卡住的下载任务`);
            }
        } catch (e) {
            console.warn('最终清理卡住任务时发生错误', e);
        }
    }

    // 完成
    indicator.complete();

    return true;
}

/**
 * 通过迅雷下载
 * @param {ThunderInfo} thunderInfo 迅雷下载信息
 */
API.Common.invokeThunder = async(thunderInfo) => {
    // 进度更新器
    const indicator = new StatusIndicator('Common_Thunder');
    indicator.setTotal(thunderInfo.tasks.length);

    // 处理迅雷下载信息
    const _thunderInfo = API.Common.handerThunderInfo(thunderInfo);

    // 通过迅雷任务数将任务分组，任务太大时无法唤起迅雷
    const tasks = _thunderInfo.tasks || [];
    const _tasks = _.chunk(tasks, QZone_Config.Common.thunderTaskNum);
    for (let i = 0; i < _tasks.length; i++) {
        const index = i + 1;
        indicator.setIndex(index);

        const list = _tasks[i];
        let taskGroupName = _thunderInfo.taskGroupName;
        if (_tasks.length > 1) {
            taskGroupName = taskGroupName + "_" + index;
        }

        // 唤起迅雷下载
        const groupTask = new ThunderInfo(taskGroupName, QZone_Config.Common.downloadThread, list)
        API.Utils.downloadByThunder(groupTask);

        // 添加唤起数
        indicator.addSuccess(list);

        // 继续唤起
        if (index < _tasks.length) {
            let sleep = QZone_Config.Common.thunderTaskSleep * 1;
            let interId = setInterval(function() {
                indicator.setNextTip(--sleep);
            }, 1000);

            // 等待指定秒再继续唤起，并给用户提示
            await API.Utils.sleep(sleep * 1000);
            clearInterval(interId);
        }
    }

    // 完成
    indicator.complete();
}

/**
 * 复制迅雷下载链接到剪切板
 * @param {ThunderInfo} thunderInfo 迅雷下载信息
 */
API.Common.copyThunderTasksToClipboard = async(thunderInfo) => {
    // 进度更新器
    const indicator = new StatusIndicator('Common_Thunder_Clipboard');
    indicator.setTotal(thunderInfo.tasks.length);
    indicator.print();

    // 处理迅雷下载信息
    const _thunderInfo = API.Common.handerThunderInfo(thunderInfo);

    // 通过迅雷任务数将任务分组，任务太大时无法唤起迅雷
    const tasks = _thunderInfo.tasks || [];
    const _tasks = _.chunk(tasks, QZone_Config.Common.thunderTaskNum);
    for (let i = 0; i < _tasks.length; i++) {
        const index = i + 1;
        indicator.setIndex(index);

        const list = _tasks[i];
        let taskGroupName = _thunderInfo.taskGroupName;
        if (_tasks.length > 1) {
            taskGroupName = taskGroupName + "_" + index;
        }

        // 唤起迅雷下载
        const groupTask = new ThunderInfo(taskGroupName, QZone_Config.Common.downloadThread, list)

        // 下载任务信息
        const copyTaskLinks = 'thunderx://' + JSON.stringify(groupTask);

        // 复制下载链接到剪切板
        navigator.clipboard.writeText(copyTaskLinks).catch((error) => {

            console.error('异步复制失败', error);

            // 创建text area
            let textArea = document.createElement("textarea");
            textArea.value = copyTaskLinks;
            // 使text area不在viewport，同时设置不可见
            textArea.style.position = "absolute";
            textArea.style.opacity = 0;
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((res, rej) => {
                // 执行复制命令并移除文本框
                document.execCommand('copy') ? res() : rej();
                textArea.remove();
            });
        });

        // 添加唤起数
        indicator.addSuccess(list);

        // 继续唤起
        if (index < _tasks.length) {
            let sleep = QZone_Config.Common.thunderTaskSleep * 1;
            let interId = setInterval(function() {
                indicator.setNextTip(--sleep);
            }, 1000);

            // 等待指定秒再继续唤起，并给用户提示
            await API.Utils.sleep(sleep * 1000);
            clearInterval(interId);
        }
    }

    // 完成
    indicator.complete();
}

/**
 * 写入迅雷任务到文件
 * @param {ThunderInfo} thunderInfo 迅雷下载信息
 */
API.Common.writeThunderTaskToFile = async(thunderInfo) => {
    // 进度更新器
    const indicator = new StatusIndicator('Common_Thunder_Link');
    indicator.print();

    // 处理迅雷下载信息
    const _thunderInfo = API.Common.handerThunderInfo(thunderInfo);

    // 分批
    const tasks = _thunderInfo.tasks || [];
    const _tasks = _.chunk(tasks, QZone_Config.Common.thunderTaskNum);
    for (let i = 0; i < _tasks.length; i++) {
        const index = i + 1;
        indicator.setIndex(index);

        const list = _tasks[i];
        let taskGroupName = _thunderInfo.taskGroupName;
        if (_tasks.length > 1) {
            taskGroupName = taskGroupName + "_" + index;
        }

        // 唤起迅雷下载
        const groupTask = new ThunderInfo(taskGroupName, QZone_Config.Common.downloadThread, list)

        // 写入文件
        const json = 'thunderx://' + JSON.stringify(groupTask);
        await API.Utils.writeText(json, API.Common.getRootFolder() + '/' + taskGroupName + '_迅雷下载链接.txt').then((fileEntry) => {
            console.info("导出迅雷下载链接完成", fileEntry);
        }).catch((error) => {
            console.error("导出迅雷下载链接异常", error);
        })

    }

    // 完成
    indicator.complete();
}

/**
 * 处理迅雷下载信息
 * @param {ThunderInfo} thunderInfo 迅雷下载信息
 */
API.Common.handerThunderInfo = (thunderInfo) => {
    // 简单克隆
    const _thunderInfo = JSON.parse(JSON.stringify(thunderInfo));

    // 移除多余属性
    const _tasks = _thunderInfo.tasks;
    for (const _temp of _tasks) {
        delete _temp.downloadState;
        delete _temp.source;
        delete _temp.module;
    }

    return _thunderInfo;
}

/**
 * 是否全量备份
 * @param {Object} moduleConfig 模块配置
 */
API.Common.isFullBackup = (moduleConfig) => {
    return moduleConfig.IncrementType === 'Full';
}

/**
 * 是否上次备份
 * @param {Object} moduleConfig 模块配置
 */
API.Common.isLast = (moduleConfig) => {
    return moduleConfig.IncrementType === 'LastTime';
}

/**
 * 是否自定义备份
 * @param {Object} moduleConfig 模块配置
 */
API.Common.isCustom = (moduleConfig) => {
    return moduleConfig.IncrementType === 'Custom';
}

/**
 * 数据是否包含上次备份的位置
 * @param {Array} new_items 新数据
 * @param {Object} moduleConfig 模块配置
 */
API.Common.isPreBackupPos = (new_items, moduleConfig) => {
    if (new_items.length == 0) {
        return false;
    }
    if (API.Common.isFullBackup(moduleConfig)) {
        return false;
    }

    // 增量备份时间
    const incrementTime = API.Utils.parseDate(moduleConfig.IncrementTime).getTime();
    // 增备份字段
    const field = moduleConfig.IncrementField;

    // 新获取到的第一条数据
    const firstTime = API.Utils.parseDate(_.first(new_items)[field]);
    // 新获取到的最后一条数据
    const lastTime = API.Utils.parseDate(_.last(new_items)[field]);

    // 情况一、第一条是符合增量时间的
    // 情况二、最后一条是符合增量时间的
    // 情况三、不是第一也不是最后
    return firstTime <= incrementTime || incrementTime >= lastTime || (firstTime <= incrementTime && incrementTime >= lastTime);
}

/**
 * 是否是新备份数据
 * @param {object} item 对象
 */
API.Common.isNewItem = (item) => {
    if (item.isNewItem === undefined) {
        return true;
    }
    return item.isNewItem;
}

/**
 * 移除已备份数据中不符合条件的数据
 * @param {Array} old_items 列表
 * @param {Object} moduleConfig 模块配置
 */
API.Common.removeOldItems = (old_items, moduleConfig) => {
    if (API.Common.isFullBackup(moduleConfig) || old_items === undefined) {
        // 选择全量备份时，直接返回空数组，当作没有历史数据处理
        return [];
    }

    // 增量备份时间
    const incrementTime = API.Utils.parseDate(moduleConfig.IncrementTime).getTime();
    // 增备份字段
    const field = moduleConfig.IncrementField;

    // items中的数据是从新到旧的，直接倒序判断时间
    for (let i = old_items.length - 1; i >= 0; i--) {
        const item = old_items[i];
        const time = API.Utils.parseDate(item[field]).getTime();
        if (time > incrementTime) {
            // 如果集合中的元素存在大于增量备份时间的，则移除
            old_items.splice(i, 1);
            continue;
        }
        // 旧数据标识
        item.isNewItem = false;
    }
    return old_items;
}

/**
 * 移除新数据中不符合条件的数据
 * @param {Array} new_items 列表
 * @param {Object} moduleConfig 模块配置
 */
API.Common.removeNewItems = (new_items, moduleConfig) => {
    if (API.Common.isFullBackup(moduleConfig)) {
        return new_items;
    }
    // 增量备份时间
    const incrementTime = API.Utils.parseDate(moduleConfig.IncrementTime).getTime();
    // 增备份字段
    const field = moduleConfig.IncrementField;

    // items中的数据是从新到旧的，直接倒序判断时间
    for (let i = new_items.length - 1; i >= 0; i--) {
        const item = new_items[i];
        const time = API.Utils.parseDate(item[field]).getTime();
        if (time < incrementTime) {
            // 如果集合中的元素存在小于增量备份时间的，则移除
            new_items.splice(i, 1);
            continue;
        }
        // 新数据标识
        item.isNewItem = true;
    }
    return new_items;
}

/**
 * 合并已备份数据
 * @param {object} moduleConfig 模块配置
 * @param {Array} old_items 已备份数据
 * @param {Array} new_items 新数据
 */
API.Common.unionBackedUpItems = (moduleConfig, old_items, new_items) => {
    if (_.isEmpty(old_items)) {
        // 如果已备份数据为空，直接返回新数据
        return new_items;
    }
    // 移除已备份数据中不符合条件的数据
    old_items = API.Common.removeOldItems(old_items, moduleConfig);

    // 移除新数据中不符合条件的数据
    new_items = API.Common.removeNewItems(new_items, moduleConfig);

    // 合并新老数据
    return API.Utils.unionItems(new_items, old_items);
}

/**
 * 保存当前备份数据
 */
API.Common.saveBackupItems = () => {

    // 状态更新器
    const indicator = new StatusIndicator('Backup_Save');
    indicator.print();

    return new Promise(function(resolve, reject) {

        // 需要保存的备份数据
        const backupInfos = {
            Backedup: window.Backedup || {}
        };

        // 历史数据
        const rows = backupInfos.Backedup[QZone.Common.Target.uin] || [];
        const oldRowMaps = _.keyBy(rows, 'module');

        // 清空数据
        rows.length = 0;

        for (const moduleName of MODULE_NAME_LIST) {

            if (QZone_Config[moduleName].IncrementType === 'Last') {
                // 备份方式为上次备份时，配置的备份时间，刷新为当前时间
                QZone_Config[moduleName].IncrementTime = API.Utils.formatDate(Date.now() / 1000);
            }

            // 历史备份数据是否为空
            const oldItems = API.Common.getOldModuleData(moduleName);

            if (!API.Common.isExport(moduleName) && _.isEmpty(oldItems)) {
                // 如果不导出，且旧数据为空，则不保存该模块
                continue;
            }

            // 是否有新数据导出
            const isNewExport = API.Common.isNewExport(moduleName);

            // 需要保存的模块数据
            const moduleInfo = oldRowMaps[moduleName] || {};
            moduleInfo.module = moduleName;
            moduleInfo.data = API.Common.getSaveModuleData(moduleName);
            moduleInfo.time = isNewExport ? Date.now() : moduleInfo.time || Date.now();
            rows.push(moduleInfo);
        }

        backupInfos.Backedup[QZone.Common.Target.uin] = rows;

        // 保存配置项，主要是上次备份时间
        chrome.storage.sync.set(QZone_Config);

        // 保存数据到Storage
        chrome.storage.local.set(backupInfos, function() {
            console.info("保存当前备份数据到Storage完成");
            indicator.complete();
            resolve(backupInfos);
        });

    })
}

/**
 * 获取模块旧数据
 * @param {String} moduleName 模块名称
 */
API.Common.getOldModuleData = (moduleName) => {
    // 新模块数据
    const module = QZone[moduleName];

    // 旧数据
    let oldData = module.OLD_Data || [];

    if (moduleName === 'Photos') {
        // 相册
        oldData = module.Album.OLD_Data || [];
    }
    if (['Boards', 'Visitors'].includes(moduleName)) {
        // 留言、访客
        oldData = module.OLD_Data.items || [];
    }
    return oldData;
}

/**
 * 获取模块新数据
 * @param {String} moduleName 模块名称
 */
API.Common.getNewModuleData = (moduleName) => {
    // 新模块数据
    const module = QZone[moduleName];

    // 旧数据
    let oldData = module.Data || [];

    if (moduleName === 'Photos') {
        // 相册
        oldData = module.Album.Data || [];
    }
    if (['Boards', 'Visitors'].includes(moduleName)) {
        // 留言、访客
        oldData = module.Data.items || [];
    }
    return oldData;
}

/**
 * 获取模块保存的数据
 * @param {String} moduleName 模块名称
 */
API.Common.getSaveModuleData = (moduleName) => {
    // 新模块数据
    const module = QZone[moduleName];

    // 数据
    let data = API.Common.isExport(moduleName) ? module.Data : module.OLD_Data

    if (moduleName === 'Photos') {
        // 相册
        data = API.Common.isExport(moduleName) ? module.Album.Data : module.Album.OLD_Data;
    }
    return data;
}


/**
 * 是否新数据导出
 * @param {String} moduleName 模块名称
 */
API.Common.isNewExport = (moduleName) => {
    // 新模块数据
    const module = QZone[moduleName];
    const isExportModule = API.Common.isExport(moduleName);

    // 旧数据
    let oldData = module.OLD_Data || [];

    // 保存的列表数据
    let moduleItems = isExportModule ? module.Data : oldData;

    if (moduleName === 'Photos') {
        // 相册
        oldData = module.Album.OLD_Data || [];
        moduleItems = isExportModule ? module.Album.Data : oldData;
    }
    if (['Boards', 'Visitors'].includes(moduleName)) {
        // 留言、访客
        oldData = module.OLD_Data.items || [];
        moduleItems = isExportModule ? module.Data.items : oldData;
    }
    return _.isEmpty(oldData) || _.some(moduleItems, item => item.isNewItem || _.some(item.photoList || [], item => item.isNewItem));
}

/**
 * 导入备份数据到JSON文件
 * @param {Object} backupInfos 已备份数据
 */
API.Common.exportBackupItemsToJson = async(backupInfos) => {

    // 状态更新器
    const indicator = new StatusIndicator('Backup_Export');
    indicator.print();

    const path = API.Common.getModuleRoot('Common') + '/json';

    // 创建JSON文件夹
    await API.Utils.createFolder(path);

    // 导出的数据
    const exportData = {
        Backedup: {}
    };
    // 仅导出备份QQ
    exportData.Backedup[QZone.Common.Target.uin] = backupInfos.Backedup[QZone.Common.Target.uin];

    // 写入JOSN
    await API.Utils.writeText(JSON.stringify(exportData), path + '/助手备份数据_' + QZone.Common.Target.uin + '.json').then((fileEntry) => {
        console.info("导出助手备份数据完成", fileEntry);
    }).catch((error) => {
        console.error("导出助手备份数据异常", error);
    });

    // 完成
    indicator.complete();
}

/**
 * 是否存在增量备份需求的模块
 */
API.Common.hasIncrementBackup = () => {
    let hasIncrementBackup = false;
    for (const exportType of QZone.Common.ExportTypes) {
        if (!QZone_Config.hasOwnProperty(exportType)) {
            continue;
        }
        const moduleCfg = QZone_Config[exportType];
        const incrCfg = moduleCfg['IncrementType'] || moduleCfg['isIncrement'];
        if (!incrCfg) {
            continue;
        }
        if (incrCfg === true || ['LastTime', 'Custom'].includes(incrCfg)) {
            hasIncrementBackup = true;
            break;
        }
    }
    return hasIncrementBackup;
}

/**
 * 获取上次备份数据
 */
API.Common.getBackupItems = () => {
    return new Promise(function(resolve, reject) {
        chrome.storage.local.get('Backedup', function(data) {
            window.Backedup = data || {};
            resolve(window.Backedup);
        });
    })
}

/**
 * 重置QQ空间备份数据
 */
API.Common.resetQZoneBackupItems = () => {
    // 遍历模块清单
    for (const moduleName of MODULE_NAME_LIST) {
        // 模块数据
        const module = QZone[moduleName] || {};
        switch (moduleName) {
            case 'Photos':
                // 相册
                module.Album.total = 0;
                module.Album.Data = [];
                module.Album.OLD_Data = [];
                break;
            case 'Boards':
                // 留言
                module.Data = {
                    items: [],
                    authorInfo: {
                        message: '',
                        sign: ''
                    },
                    total: 0
                };
                module.OLD_Data = {
                    items: [],
                    authorInfo: {
                        message: '',
                        sign: ''
                    },
                    total: 0
                };
                break;
            case 'Visitors':
                // 访客
                module.Data = {
                    items: [],
                    total: 0,
                    totalPage: 0
                }
                module.OLD_Data = {
                    items: [],
                    total: 0,
                    totalPage: 0
                }
                break;
            default:
                module.total = 0;
                module.Data = [];
                module.OLD_Data = [];
                break;
        }
    }
}

/**
 * 初始化已备份数据到全局变量
 */
API.Common.initBackedUpItems = async() => {
    if (!API.Common.hasIncrementBackup()) {
        // 本次备份，不存在需要增量备份的模块，无需获取上次备份数据
        return;
    }
    // 进度提示
    const indicator = new StatusIndicator('InitIncrement');
    indicator.print();

    // 获取所有备份QQ的数据
    window.Backedup = await API.Common.getBackupItems() || {};
    window.Backedup = window.Backedup.Backedup || {}
    if (!window.Backedup || Object.keys(window.Backedup).length == 0) {
        // 没有上次备份数据
        indicator.complete();
        return;
    }

    // 指定QQ号数据
    const oldDatas = window.Backedup[QZone.Common.Target.uin] || [];
    if (!oldDatas || oldDatas.length == 0) {
        // 没有上次备份数据
        indicator.complete();
        return;
    }

    for (const moduleName of MODULE_NAME_LIST) {
        // 模块数据
        const module = QZone[moduleName] || {};

        const oldModule = _.find(oldDatas, ['module', moduleName]) || {};

        // 更新模块备份时间
        if (QZone_Config[moduleName].IncrementType === 'LastTime') {
            QZone_Config[moduleName].IncrementTime = oldModule.time ? API.Utils.formatDate(oldModule.time / 1000) : Default_IncrementTime;
        }

        switch (moduleName) {
            case 'Photos':
                // 相册
                module.Album.OLD_Data = oldModule.data || [];
                // 是否新数据标识
                module.Album.OLD_Data.forEach(album => {
                    // 相册标识
                    album.isNewItem = false;

                    // 相片标识
                    album.photoList = album.photoList || [];
                    album.photoList.forEach(photo => {
                        photo.isNewItem = false;
                    });
                });
                break;
            case 'Boards':
                // 留言
                module.OLD_Data = oldModule.data || {
                    items: [],
                    authorInfo: {
                        message: '',
                        sign: ''
                    },
                    total: 0
                };
                // 是否新数据标识
                module.OLD_Data.items.forEach(item => {
                    item.isNewItem = false;
                });
                break;
            case 'Visitors':
                // 访客
                module.OLD_Data = oldModule.data || {
                    items: [],
                    authorInfo: {
                        message: '',
                        sign: ''
                    },
                    total: 0
                };
                // 是否新数据标识
                module.OLD_Data.items.forEach(item => {
                    item.isNewItem = false;
                });
                break;
            default:
                module.OLD_Data = oldModule.data || [];
                // 是否新数据标识
                module.OLD_Data.forEach(item => {
                    item.isNewItem = false;
                });
                break;
        }
    }
    indicator.complete();
}

/**
 * 是否存在下一页
 * @param {integer} pageIndex 下一页索引
 * @param {integer} pageSize 每页条目数
 * @param {integer} total 总数
 * @param {Array} items 已获取数据数组
 */
API.Common.hasNextPage = (pageIndex, pageSize, total, items) => {
    return items.length < total && pageIndex * pageSize < total;
}

/**
 * 获取下一页数据
 * @param {integer} pageIndex 下一页索引
 * @param {object} moduleConfig 模块配置
 * @param {integer} total 总数
 * @param {Array} items 已获取数据
 * @param {Function} call 下一页函数
 * @param {Array} args 下一页函数参数
 */
API.Common.callNextPage = async(pageIndex, moduleConfig, total, items, call, ...args) => {
    // 是否存在下一页
    const hasNextPage = API.Common.hasNextPage(pageIndex, moduleConfig.pageSize, total, items);
    if (hasNextPage) {
        // 请求一页成功后等待一秒再请求下一页
        const min = moduleConfig.randomSeconds.min;
        const max = moduleConfig.randomSeconds.max;
        const seconds = API.Utils.randomSeconds(min, max);
        await API.Utils.sleep(seconds * 1000);
        return await call.apply(undefined, args);
    }
    return items;
}

/**
 * 指定模块是否勾选导出
 * @param {string} moduleType 导出模块类型值
 */
API.Common.isExport = (moduleType) => {
    return QZone.Common.ExportTypes.indexOf(moduleType) > -1;
}

/**
 * 设置比较差异的字段值
 * @param {Array} items 列表
 * @param {string} sourceFiled 源字段
 * @param {string} targetFiled 目标字段
 */
API.Common.setCompareFiledInfo = (items, sourceFiled, targetFiled) => {
    // 处理发布时间，兼容增量备份
    for (const item of items) {
        if (!item.hasOwnProperty(sourceFiled) || item.hasOwnProperty(targetFiled)) {
            continue;
        }
        item[targetFiled] = Math.floor(API.Utils.parseDate(item[sourceFiled]).getTime() / 1000);
    }
    return items;
}

/**
 * 是否需要获取赞
 * @param {Object} CONFIG 模块配置项
 */
API.Common.isGetLike = (CONFIG) => {
    return CONFIG.Like.isGet && (CONFIG.exportType === 'HTML' || CONFIG.exportType == 'JSON')
}

/**
 * 是否需要获取最近访问
 * @param {Object} CONFIG 模块配置项
 */
API.Common.isGetVisitor = (CONFIG) => {
    return CONFIG.Visitor.isGet && (CONFIG.exportType === 'HTML' || CONFIG.exportType == 'JSON')
}

/**
 * 获取模块点赞记录
 * @param {Object} item 对象
 */
API.Common.getModulesLikeList = async(item, moduleConfig) => {
    let nextUin = 0;
    item.likes = item.likes || [];
    if (!moduleConfig.Like.isGet) {
        return item.likes;
    }
    let hasNext = true;
    while (hasNext) {
        await API.Common.getLikeList(item.uniKey, nextUin).then(async(data) => {
            data = API.Utils.toJson(data, /^_Callback\(/);
            if (data.code && data.code != 0) {
                // 获取异常
                console.warn('获取模块点赞记录异常：', data);
            }
            data = data.data || {};

            data.like_uin_info = data.like_uin_info || [];
            if (_.isEmpty(data.like_uin_info)) {
                hasNext = false;
            } else {
                item.likes = _.concat(item.likes, data.like_uin_info);
                nextUin = _.last(item.likes)['fuin'];

                // 请求一页成功后等待一秒再请求下一页
                const min = moduleConfig.Like.randomSeconds.min;
                const max = moduleConfig.Like.randomSeconds.max;
                const seconds = API.Utils.randomSeconds(min, max);
                await API.Utils.sleep(seconds * 1000);
            }
        }).catch((e) => {
            hasNext = false;
            console.error("获取点赞数据异常", item, e);
        });
    }
    item.likeTotal = item.likes.length;
    return item.likes;
}

/**
 * 添加QQ空间用户的头像下载
 * @param {Object} user 用户
 */
API.Common.downloadUserAvatar = (user) => {
    if (API.Common.isQzoneUrl() || !user || !user.uin) {
        // 如果为QQ空间外链，则不下载
        return;
    }
    const avatarUrl = API.Common.getUserLogoUrl(user.uin);
    if (QZone.Common.FILE_URLS.has(avatarUrl)) {
        // 添加过下载任务则跳过
        user.avatar = API.Common.getUserLogoUrl(user.uin);
        user.custom_avatar = API.Common.getUserLogoLocalUrl(user.uin);
        return;
    }

    // 头像默认使用jpg后缀（QQ头像通常是jpg格式）
    const avatarFileName = user.uin + '.jpg';
    API.Utils.newDownloadTask('Friends', avatarUrl, 'Common/images', avatarFileName, user, true);
    user.avatar = API.Common.getUserLogoUrl(user.uin);
    user.custom_avatar = API.Common.getUserLogoLocalUrl(user.uin);

    // 添加映射
    QZone.Common.FILE_URLS.set(avatarUrl, user.custom_avatar);
}

/**
 * 添加QQ空间用户的头像下载
 * @param {Array} users 用户列表
 */
API.Common.downloadUserAvatars = (users) => {
    if (API.Common.isQzoneUrl() || !users) {
        // 如果为QQ空间外链，则不下载
        return;
    }
    for (const user of users) {
        API.Common.downloadUserAvatar(user);
    }
}

/**
 * 导出助手到JSON文件
 * @param {Array} friends 好友列表
 */
API.Common.exportConfigToJson = async() => {

    if (API.Common.isOnlyFileExport()) {
        // 仅文件导出，无需导出配置文件
        console.log('仅文件导出，无需导出配置文件');
        return;
    }

    // 状态更新器
    const indicator = new StatusIndicator('User_Config_Infos');
    indicator.print();

    const path = API.Common.getModuleRoot('Common') + '/json';

    console.info('生成助手配置JSON开始', QZone_Config);
    // 创建JSON文件夹
    await API.Utils.createFolder(path);
    // 写入JOSN
    const jsonFile = await API.Common.writeJsonToJs('QZone_Config', QZone_Config, API.Common.getModuleRoot('Common') + '/json/config.js');
    console.info('生成助手配置JSON结束', jsonFile, QZone_Config);

    // 完成
    indicator.complete();
}

/**
 * 是否仅导出文件
 */
API.Common.isOnlyFileExport = () => {
    if (QZone.Common.ExportTypes.length > 2) {
        // 大于两个的备份模块，都不是仅文件导出
        return false;
    }
    if (QZone.Common.ExportTypes.includes('Photos') && QZone.Common.ExportTypes.includes('Videos')) {
        // 相册导出类型为文件、视频导出类型为文件
        const isFile = QZone_Config.Photos.exportType === 'File' && QZone_Config.Videos.exportType === 'File';
        // 且下载工具不为下载链接
        return isFile && QZone_Config.Common.downloadType !== 'Thunder_Link';
    }
    // 包含非相册或非视频的，都不是仅文件导出
    return false;
}

/**
 * 是否继续获取下一页
 * @param {Array} oldItems 历史备份条目
 * @param {Array} pageItems 新页的条目
 * @param {Object} moduleCfg 模块的配置信息
 */
API.Common.isGetNextPage = (oldItems, pageItems, moduleCfg) => {
    if (API.Common.isFullBackup(moduleCfg)) {
        // 如果是全量备份，需要继续获取下一页，是否获取到末页不在这里判断，在hasNextPage判断
        return true;
    }
    if (API.Common.isCustom(moduleCfg)) {
        // 如果是自定义备份，则需判断是否备份到指定时间的位置
        return !API.Common.isPreBackupPos(pageItems, moduleCfg);
    }
    if (API.Common.isLast(moduleCfg)) {
        // 如果是上次备份，则需要判断是否达到上次备份的位置
        if (_.isEmpty(oldItems)) {
            return true;
        }
        return !API.Common.isPreBackupPos(pageItems, moduleCfg);
    }
    return true;
}

/**
 * 导出用户头像
 * @returns 
 */
API.Common.exportUserAvatar = async() => {

    if (API.Common.isQzoneUrl()) {
        // QQ空间外链，无需导出
        console.log('QQ空间外链，无需导出');
        return;
    }

    // 状态更新器
    const indicator = new StatusIndicator('User_Avatar_Export');
    indicator.print();

    try {

        // 收集所有的互动用户
        const users = API.Statistics.getAllInteractiveUsers();

        // 移除在好友清单中的
        _.remove(users, u_item => _.findIndex(QZone.Friends.Data, _.findIndex(users, ['uin', u_item.uin])) > -1);

        // 添加目标头像下载任务
        API.Common.downloadUserAvatars(users);

    } catch (error) {
        console.error('导出用户头像异常，默认忽略不处理，按道理不会失败！', error);
    }

    // 完成
    indicator.complete();
}