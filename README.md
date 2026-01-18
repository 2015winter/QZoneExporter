# QQ空间导出助手

> 一键快速备份QQ空间的说说、日志、日记、相册、视频、留言、好友、收藏、分享、访客为文件，便于迁移与保存。

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome)](https://github.com/ShunCai/QZoneExport)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](https://developer.chrome.com/docs/extensions/mv3/)
[![Version](https://img.shields.io/badge/Version-3.0-orange)](https://github.com/ShunCai/QZoneExport)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

## 项目简介

落叶随风，青春稍纵即逝，QQ空间是承载了很多人青春记忆的地方。

随着新浪博客相册、网易相册、腾讯微博等相继停运，互联网产品都有着自己的生命周期。为了保存这些珍贵的回忆，QQ空间导出助手应运而生——一个简单易用、功能全面的QQ空间数据备份工具。

[![我是往事随风。你好，我是轻舞飞扬。](https://s1.ax1x.com/2020/05/16/YcekPP.gif)](https://v.qq.com/x/page/f08719wqfd0.html)

## 功能特性

### 支持备份的内容类型

| 模块 | 备份内容 | 附属数据 |
|------|----------|----------|
| 说说 | 文字说说、图文说说、语音说说、长说说 | 评论、点赞、最近访问 |
| 日志 | 文字日志、图文日志、模板日志 | 评论、点赞、最近访问 |
| 日记 | 文字日记、图文日记 | 评论、点赞、最近访问 |
| 相册 | 相册/相片 | 评论、点赞、最近访问 |
| 视频 | 空间视频 | 评论、点赞、最近访问 |
| 留言 | 留言寄语、留言内容 | 留言回复 |
| 好友 | QQ好友列表 | 成立时间、单向好友检测、空间权限检测、特别关心 |
| 收藏 | 收藏内容 | - |
| 分享 | 分享内容 | 评论、点赞、最近访问 |
| 访客 | 访客记录 | - |

### 核心功能

- **多种导出格式**：HTML、Markdown、JSON、Excel
- **增量备份**：支持基于时间的增量备份
- **多种下载方式**：浏览器下载、迅雷下载、Aria2下载
- **关键词过滤**：支持屏蔽词过滤说说内容
- **数据统计**：提供可视化数据统计报告
- **离线查看**：支持断网状态下查看备份内容

## 技术架构

### 项目结构

```
src/
├── manifest.json          # Chrome扩展配置 (Manifest V3)
├── js/
│   ├── background.js      # Service Worker 后台脚本
│   ├── content.js         # 内容脚本（注入QQ空间页面）
│   ├── config.js          # 配置管理
│   ├── api.js             # API调用封装
│   ├── utils.js           # 工具函数
│   ├── popup.js           # 弹出页面逻辑
│   ├── options.js         # 配置页面逻辑
│   └── modules/           # 功能模块
│       ├── common.js      # 公共模块
│       ├── messages.js    # 说说模块
│       ├── blogs.js       # 日志模块
│       ├── diaries.js     # 日记模块
│       ├── photos.js      # 相册模块
│       ├── videos.js      # 视频模块
│       ├── boards.js      # 留言模块
│       ├── friends.js     # 好友模块
│       ├── favorites.js   # 收藏模块
│       ├── shares.js      # 分享模块
│       └── visitors.js    # 访客模块
├── html/                  # HTML页面
│   ├── popup.html         # 弹出页面
│   ├── options.html       # 配置页面
│   ├── indicator.html     # 进度指示器
│   └── tools.html         # 工具页面
├── css/                   # 样式文件
├── templates/             # 导出HTML模板
├── export/                # 导出文件的CSS/JS
└── vendor/                # 第三方依赖库
```

### 技术栈

- **扩展框架**：Chrome Extension Manifest V3
- **前端框架**：jQuery + Bootstrap
- **模板引擎**：Template.js
- **文件处理**：JSZip + FileSaver.js + Filer
- **数据转换**：Turndown (HTML→Markdown)、SheetJS (Excel)
- **图片预览**：lightGallery

## 快速开始

### 安装方式

1. **Chrome 应用商店**（推荐）
   - 搜索"QQ空间导出助手"安装

2. **开发者模式安装**
   - 下载本项目源码
   - 打开 Chrome 扩展管理页面 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"，选择 `src` 目录

### 使用步骤

1. 阅读[隐私政策](https://www.lvshuncai.com/archives/qzone-export-privacy-policy.html)，安装并配置助手
2. 登录并访问需要备份的QQ空间
3. 点击浏览器扩展栏的助手图标开始备份
4. 等待数据采集完成（主号建议睡前备份）
5. 点击**打包下载**按钮下载文案内容压缩包
6. 等待多媒体文件下载完成
7. 合并文案内容和多媒体文件到同一文件夹
8. 打开 `index.html` 查看备份内容

### 新手导航

1. [查看助手隐私政策](https://www.lvshuncai.com/archives/qzone-export-privacy-policy.html)
2. [如何安装助手](https://www.lvshuncai.com/archives/qzone-export-install.html)
3. [简易视频教程](#视频教程)
4. [常见热门问题](https://www.lvshuncai.com/archives/qzone-export-issue.html)
5. [如何配置助手](https://www.lvshuncai.com/archives/qzone-export-configuration.html)
6. [如何开始备份](https://www.lvshuncai.com/archives/qzone-export-usage.html)
7. [如何离线查看备份内容](https://www.lvshuncai.com/archives/switch-qzx-jsdelivr-to-local.html)

## 视频教程

去 [bilibili查看](https://www.bilibili.com/video/BV16r4y1x7hP?zw)
> 来源于助手用户 [阿博特-安稳](https://space.bilibili.com/36411485) 投稿

## 备份预览

**本预览内容基于HTML备份类型生成，[点击这里浏览完整预览](https://demo.lvshuncai.com/qzone-export/index.html)**

### 首页预览
![首页预览](https://s1.ax1x.com/2022/10/25/xWCMyF.png)

### 说说预览
![说说预览](https://s1.ax1x.com/2022/10/25/xWC8oR.png)

### 日志预览
![日志预览](https://s1.ax1x.com/2022/10/25/xWCtW6.png)
![日志详情](https://s1.ax1x.com/2022/10/25/xWCdyD.png)

### 相册预览
![相册预览](https://s1.ax1x.com/2022/10/25/xWCDwd.png)
![相片预览](https://s1.ax1x.com/2022/10/25/xWCrTA.png)

### 留言预览
![留言预览](https://s1.ax1x.com/2022/10/25/xWC2Sf.png)

### 好友预览
![好友预览](https://s1.ax1x.com/2022/10/25/xWCITs.png)

## 项目依赖

| 依赖库 | 用途 |
|--------|------|
| [jQuery](https://github.com/jquery/jquery) | DOM操作 |
| [Bootstrap](https://github.com/twbs/bootstrap) | UI框架 |
| [Lodash](https://github.com/lodash/lodash) | 工具函数 |
| [JSZip](https://github.com/Stuk/jszip) | ZIP压缩 |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js) | 文件保存 |
| [Filer](https://github.com/nicmario/filer) | 文件系统 |
| [Turndown](https://github.com/domchristie/turndown) | HTML转Markdown |
| [SheetJS](https://github.com/sheetjs/sheetjs) | Excel导出 |
| [Template.js](https://github.com/yanhaijing/template.js) | 模板引擎 |
| [lightGallery](https://github.com/sachinchoolur/lightGallery) | 图片预览 |
| [Moment.js](https://github.com/moment/moment) | 日期处理 |
| [Font Awesome](https://fontawesome.com/) | 图标库 |

## 配置说明

助手支持丰富的配置选项，包括：

- **通用配置**：重试次数、重试间隔、下载线程数等
- **下载方式**：浏览器下载、Aria2、迅雷
- **模块配置**：各模块的分页大小、导出格式、增量备份设置
- **过滤配置**：关键词过滤、时间过滤

详细配置请参考 [配置文档](https://www.lvshuncai.com/archives/qzone-export-configuration.html)

## 注意事项

1. 本项目仅供个人学习研究使用，随时可能因不可抗力因素下架
2. 本助手开源免费，请勿从第三方购买或下载
3. 本助手基于 [QQ空间官方网站](https://qzone.qq.com/index.html) 备份个人空间数据，与QQ空间官方无关
4. 使用本助手即同意收集QQ空间网站的Cookie信息，仅用于获取数据，不传输到后台服务器
5. 更多详情请查看 [隐私政策](https://www.lvshuncai.com/archives/qzone-export-privacy-policy.html)

## 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议
