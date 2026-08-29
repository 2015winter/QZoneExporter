# QQ空间导出助手 | QZone Exporter

> **QZone Export Tool / QQ空间数据导出备份工具 / Qzone Data Backup Chrome Extension**
>
> 🌟 一键备份QQ空间的说说、日志、日记、相册、视频、留言板、好友、收藏、分享、访客，保存青春记忆。
>
> Export and backup your QQ Zone (Qzone) memories: messages, blogs, diaries, albums, videos, comments, friends list, favorites, shares, and visitors.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome)](https://github.com/2015winter/QZoneExporter)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](https://developer.chrome.com/docs/extensions/mv3/)
[![Version](https://img.shields.io/badge/Version-3.0-orange)](https://github.com/2015winter/QZoneExporter)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue)](./LICENSE)

落叶随风，青春稍纵即逝。QQ空间承载了很多人的青春记忆。随着新浪博客、网易相册、腾讯微博相继停运，互联网产品都有自己的生命周期。为保存这些珍贵回忆，QQ空间导出助手应运而生。

## 📦 功能特性 | Features

<details>
<summary>English</summary>

- **Multi-format Export** - HTML / Markdown / JSON / Excel
- **Incremental Backup** - Time-based filtering, avoid duplicates
- **Multiple Download Methods** - Browser / Thunder / Aria2
- **Content Filtering** - Keyword blocking, time range
- **Data Statistics** - Visual reports
- **Offline Viewing** - Browse without network
- **Light / Dark Theme** - Toggle on exported pages, preference is remembered

</details>

**支持备份的内容**

| 内容模块 | 说说 · 日志 · 日记 · 相册 · 视频 · 分享 |
|:--------:|:---------------------------------------|
| 附属数据 | 评论、点赞、最近访客 |

| 社交模块 | 留言 · 好友 · 收藏 · 访客 |
|:--------:|:-------------------------|
| 附属数据 | 留言回复、成立时间、单向检测、权限检测、特别关心 |

**核心能力**

- 📄 **多格式导出** - HTML / Markdown / JSON / Excel
- 🔄 **增量备份** - 基于时间过滤，避免重复
- ⬇️ **多种下载** - 浏览器 / 迅雷 / Aria2
- 🔍 **内容过滤** - 关键词屏蔽、时间范围
- 📊 **数据统计** - 可视化报告
- 📴 **离线查看** - 断网可浏览
- 🎨 **浅色 / 深色** - 备份页右下角切换，选择会记住

## 🚀 快速开始 | Quick Start

### 安装 | Installation

**Chrome 应用商店（推荐）** - 搜索 "QQ空间导出助手" 安装

**开发者模式** - 下载源码 → 打开 `chrome://extensions/` → 开启开发者模式 → 加载 `src` 目录

### 使用 | Usage

1. 阅读 [隐私政策](./docs/privacy-policy.md)，安装配置助手
2. 登录并访问需要备份的QQ空间
3. 点击扩展图标开始备份（主号建议睡前）
4. 点击 **打包下载** 获取文案压缩包
5. 等待多媒体下载完成后，合并到同一目录
6. 打开 `index.html` 查看备份（右下角可切换浅色 / 深色）

## 📖 帮助文档 | Documentation

**本地文档（推荐）：**

[🔒 隐私政策](./docs/privacy-policy.md) · [📥 安装教程](./docs/install.md) · [⚙️ 配置说明](./docs/configuration.md) · [📖 使用指南](./docs/usage.md) · [❓ 常见问题](./docs/faq.md) · [📴 离线查看](./docs/offline.md)

**视频教程：** [B站视频教程](https://www.bilibili.com/video/BV16r4y1x7hP?zw)

## 🖼 备份预览 | Preview

[👉 点击查看在线演示](https://demo.laxdu.com/qzone/index.html)

本地预览：在仓库根目录执行 `python3 -m http.server 8080 --directory demo`，浏览器打开 `http://127.0.0.1:8080/`。

<details open>
<summary>展开查看截图</summary>

| 首页 | 说说 |
|:----:|:----:|
| <img src="https://media.githubusercontent.com/media/2015winter/ImageHosting/refs/heads/main/Q/QZone/首页.png" width="400"> | <img src="https://media.githubusercontent.com/media/2015winter/ImageHosting/refs/heads/main/Q/QZone/说说.png" width="400"> |

| 日志 | 相册 |
|:----:|:----:|
| <img src="https://media.githubusercontent.com/media/2015winter/ImageHosting/refs/heads/main/Q/QZone/日志.png" width="400"> | <img src="https://media.githubusercontent.com/media/2015winter/ImageHosting/refs/heads/main/Q/QZone/相册.png" width="400"> |

| 留言 | 好友 |
|:----:|:----:|
| <img src="https://media.githubusercontent.com/media/2015winter/ImageHosting/refs/heads/main/Q/QZone/留言.png" width="400"> | <img src="https://media.githubusercontent.com/media/2015winter/ImageHosting/refs/heads/main/Q/QZone/好友.png" width="400"> |

| 收藏 | 视频 |
|:----:|:----:|
| <img src="https://media.githubusercontent.com/media/2015winter/ImageHosting/refs/heads/main/Q/QZone/收藏.png" width="400"> | <img src="https://media.githubusercontent.com/media/2015winter/ImageHosting/refs/heads/main/Q/QZone/视频.png" width="400"> |

</details>

## 🏗 技术架构 | Architecture

<details open>
<summary>项目结构</summary>

```
src/
├── manifest.json              # 扩展配置 (Manifest V3)
├── js/
│   ├── background.js          # Service Worker
│   ├── content.js             # 内容脚本
│   ├── api.js                 # API 封装
│   ├── config.js              # 配置管理
│   └── modules/               # 功能模块 (说说/日志/相册等)
├── html/                      # 扩展页面
├── css/                       # 扩展样式
├── templates/                 # 导出 HTML 模板
├── export/                    # 导出静态资源（随备份一起复制）
│   ├── css/
│   │   ├── common.css         # 公共基础、侧边栏、画廊
│   │   ├── theme.css          # 设计令牌、浅色/深色
│   │   ├── components.css     # 跨页组件（页脚、灯箱等）
│   │   └── pages/             # 模块专属（说说/日志/视频/相册）
│   └── js/
│       ├── common.js
│       ├── sidebar.js
│       └── theme.js           # 主题切换、回到顶部
└── vendor/                    # 第三方库
```

备份目录中对应为 `Common/css/`、`Common/js/`。打开任意备份页即可使用右下角主题按钮。

</details>

<details open>
<summary>技术栈</summary>

| 分类 | 技术 |
|------|------|
| 扩展框架 | Chrome Extension Manifest V3 |
| 前端框架 | jQuery + Bootstrap |
| 文件处理 | JSZip、FileSaver.js、Filer |
| 格式转换 | Turndown (HTML→MD)、SheetJS (Excel) |
| 其他 | Template.js、lightGallery、Lodash、Moment.js |
| 导出页主题 | CSS 变量 + `localStorage` 记忆浅色/深色 |

</details>

## ⚠️ 注意事项 | Notice

- 本项目仅供个人学习研究，随时可能因不可抗力下架
- 本助手开源免费，请勿从第三方购买
- 基于 [QQ空间官方网站](https://qzone.qq.com/index.html) 备份数据，与官方无关
- 使用即同意收集QQ空间Cookie（仅用于获取数据，不传输至后台）
- 详情请阅读 [隐私政策](./docs/privacy-policy.md)

## 📜 开源协议 | License

[Apache License 2.0](./LICENSE)

---

## 🔍 搜索关键词 | Keywords

**中文**: QQ空间导出, QQ空间备份, QQ空间数据导出, 说说导出, 相册导出, 日志导出, QQ空间爬虫, QQ空间下载器, 空间备份工具

**English**: QZone Exporter, Qzone Export, QQ Zone Backup, QZone Backup Tool, Qzone Data Export, QQ Zone Export Chrome Extension, Qzone Crawler, QZone Downloader, QQ Space Export, Qzone Archive
