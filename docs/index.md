# QQ空间导出助手

> **QZone Exporter - 一键备份你的青春记忆**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green?logo=googlechrome)](https://github.com/2015winter/QZoneExporter)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)](https://developer.chrome.com/docs/extensions/mv3/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue)](../LICENSE)

---

## 📖 简介

落叶随风，青春稍纵即逝。QQ空间承载了很多人的青春记忆。

随着新浪博客、网易相册、腾讯微博相继停运，互联网产品都有自己的生命周期。为保存这些珍贵回忆，**QQ空间导出助手**应运而生。

一键备份QQ空间的说说、日志、日记、相册、视频、留言板、好友、收藏、分享、访客，让青春永不褪色。

---

## ✨ 功能特性

### 支持备份的内容

| 内容模块 | 附属数据 |
|---------|---------|
| 📝 说说 | 评论、点赞、最近访客 |
| 📰 日志 | 评论、点赞、最近访客 |
| 📔 日记 | 评论、点赞 |
| 📷 相册 | 相册/相片评论、点赞、访客 |
| 🎬 视频 | 评论、点赞 |
| 💬 留言 | 留言回复 |
| 👥 好友 | 成立时间、单向检测、权限检测、特别关心 |
| ⭐ 收藏 | - |
| 🔗 分享 | 评论、点赞、访客 |
| 👀 访客 | 访问记录 |

### 核心能力

| 功能 | 说明 |
|------|------|
| 📄 **多格式导出** | HTML / Markdown / JSON / Excel |
| 🔄 **增量备份** | 基于时间过滤，避免重复 |
| ⬇️ **多种下载** | 浏览器 / Motrix / Aria2 / 迅雷 |
| 🔍 **内容过滤** | 关键词屏蔽、时间范围 |
| 📊 **数据统计** | 可视化报告 |
| 📴 **离线查看** | 断网可浏览 |

---

## 🚀 快速开始

### 安装

| 方式 | 说明 |
|------|------|
| **应用商店** | Chrome / Edge / 360 商店搜索「QQ空间导出助手」 |
| **开发者模式** | 下载源码 → 开启开发者模式 → 加载 `src` 目录 |

详细教程：[安装指南](./install.md)

### 使用

1. 阅读 [隐私政策](./privacy-policy.md)，配置助手
2. 登录并访问需要备份的QQ空间
3. 点击扩展图标开始备份
4. 点击「打包下载」获取文案压缩包
5. 等待多媒体下载完成后，合并到同一目录
6. 打开 `index.html` 查看备份

详细教程：[使用指南](./usage.md)

---

## 📚 文档导航

| 文档 | 说明 |
|------|------|
| [🔒 隐私政策](./privacy-policy.md) | 了解数据安全与隐私保护 |
| [📥 安装教程](./install.md) | 如何安装助手 |
| [⚙️ 配置说明](./configuration.md) | 如何配置助手 |
| [📖 使用指南](./usage.md) | 如何使用助手进行备份 |
| [❓ 常见问题](./faq.md) | 遇到问题先看这里 |
| [📴 离线查看](./offline.md) | 如何在断网状态下查看备份 |

---

## 🖼️ 备份预览

HTML 备份格式支持美观的可视化展示，包括：

- 📱 响应式布局
- 🖼️ 图片画廊
- 📊 数据统计图表
- 🔍 内容搜索
- 📅 时间线浏览

---

## ⚠️ 注意事项

| 事项 | 说明 |
|------|------|
| **个人使用** | 本项目仅供个人学习研究 |
| **开源免费** | 请勿从第三方购买 |
| **无官方关联** | 基于 QQ空间官方网站备份，与官方无关 |
| **Cookie 收集** | 使用即同意收集QQ空间Cookie（仅用于获取数据） |
| **数据安全** | 数据仅保存到本地，不传输至后台 |

详情请阅读 [隐私政策](./privacy-policy.md)

---

## 📞 联系我们

| 渠道 | 链接 |
|------|------|
| **GitHub** | [Issues](https://github.com/2015winter/QZoneExporter/issues) |
| **QQ 群** | 959828088 |

---

## 📜 更新日志

### v3.0 (2025-01)

**重大更新 - Manifest V3 升级 + 社区维护版**

#### 🚀 核心升级
- **升级到 Manifest V3** - 适配 Chrome 最新扩展标准
- Background Page 迁移至 Service Worker
- 移除迅雷唤起组件（迅雷下载改为链接复制方式）
- 更新 Content Security Policy

#### 🎨 界面优化
- 全新的备份预览界面
- 说说、日志、留言、好友等模块布局风格美化
- 左侧栏宽度变更时右侧自适应
- 相册模块相片预览切换优化（消除闪烁）
- 视频页面统一风格样式，支持小窗播放
- 访客模块同一月份折叠显示
- 留言模块按年份分页

#### 📦 离线资源本地化
- CDN 资源已打包到扩展本地
- 备份文件无需联网即可查看
- 包含 Bootstrap、jQuery、lightGallery、ECharts 等

#### 🐛 问题修复
- 修复收藏模块侧边栏拉伸时右侧自适应问题
- 修复相册模块相片预览切换时闪烁问题
- 修复说说模块预览图片视频问题
- 修复收藏模块图片分辨率依赖错误问题
- 修复视频小窗播放右键问题
- 修复分享模块引用网文链接问题
- 修复留言模块那年今日头像不显示问题

#### 🔧 技术改进
- 原型污染防护
- 废弃 API 修复（XMLHttpRequest → fetch）
- 下载并行优化
- Aria2 队列控制功能增强

#### 📝 文档更新
- 文档迁移至项目仓库
- 文档内容全面优化

---

### v2.x 历史版本

<details>
<summary>点击展开历史版本记录</summary>

#### v2.0
- Manifest V2 最终版本
- 支持迅雷唤起下载
- CDN 在线加载模式

#### v1.x
- 初始版本
- 基础备份功能
- 多格式导出支持

</details>

---

## 🙏 致谢

### 原作者

感谢 **[芷炫](https://github.com/ShunCai)** 创建并维护本项目至 2023 年 3 月。

> *天地是万物众生的客舍，光阴是古往今来的过客。*
> *青春，总会逝去，宴席，总会散场。*

### 社区贡献者

感谢所有为本项目做出贡献的开发者和用户。

### 开源依赖

| 项目 | 用途 |
|------|------|
| [jQuery](https://jquery.com/) | DOM 操作 |
| [Bootstrap](https://getbootstrap.com/) | UI 框架 |
| [JSZip](https://stuk.github.io/jszip/) | 压缩打包 |
| [FileSaver.js](https://github.com/eligrey/FileSaver.js) | 文件保存 |
| [Turndown](https://github.com/domchristie/turndown) | HTML 转 Markdown |
| [SheetJS](https://sheetjs.com/) | Excel 导出 |
| [lightGallery](https://www.lightgalleryjs.com/) | 图片画廊 |
| [ECharts](https://echarts.apache.org/) | 数据可视化 |
| [Lodash](https://lodash.com/) | 工具函数 |

---

## 📄 开源协议

[Apache License 2.0](../LICENSE)

---

*让青春永不褪色，让回忆永远鲜活。* 💫
