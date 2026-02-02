# QQ空间导出助手 - 离线查看指南

> **Offline Viewing Guide for QZone Exporter**

---

## 📖 概述

### V3.0 版本：默认支持离线查看 ✅

从 v3.0 版本开始，**备份文件默认支持离线查看**，无需额外配置！

所有依赖的第三方库（jQuery、Bootstrap、lightGallery、ECharts 等）已打包到扩展本地，备份时会自动复制到备份目录的 `Common/vendor` 文件夹中。

### 离线资源列表

| 资源 | 用途 |
|------|------|
| jQuery 3.6.0 | DOM 操作 |
| Bootstrap 4.6.1 | UI 框架 |
| Bootstrap Table | 表格组件 |
| lodash 4.17.21 | 工具函数 |
| Moment.js | 时间处理 |
| ECharts | 数据可视化 |
| lightGallery | 图片画廊 |
| Font Awesome 4.7 | 图标字体 |

---

## ✅ 验证离线功能

完成备份后，验证离线功能是否正常：

1. **断开网络连接**

2. **打开 `index.html`**

3. **检查以下内容：**
   - [ ] 页面样式正常显示
   - [ ] 图片正常加载（需要图片文件已下载）
   - [ ] 导航菜单可点击
   - [ ] 图表正常显示
   - [ ] 图片画廊可预览

---

## 📁 备份目录结构

v3.0 版本备份后的目录结构：

```
QQ空间备份_123456/
├── index.html                    # 首页
├── Common/
│   ├── css/
│   │   └── common.css            # 公共样式
│   ├── js/
│   │   ├── common.js             # 公共脚本
│   │   └── sidebar.js            # 侧边栏脚本
│   ├── images/
│   │   └── ...                   # 公共图片
│   └── vendor/                   # ⭐ 离线资源目录
│       ├── css/
│       │   ├── bootstrap.min.css
│       │   ├── bootstrap-table.min.css
│       │   ├── font-awesome.min.css
│       │   ├── lightgallery.min.css
│       │   └── lightgallery-bundle.min.css
│       ├── fonts/
│       │   └── fontawesome-webfont.woff2
│       └── js/
│           ├── jquery.min.js
│           ├── bootstrap.bundle.min.js
│           ├── bootstrap-table.min.js
│           ├── lodash.min.js
│           ├── moment.min.js
│           ├── echarts.min.js
│           ├── lightgallery.min.js
│           ├── lg-zoom.min.js
│           ├── lg-thumbnail.min.js
│           └── ...
├── Messages/                     # 说说
├── Albums/                       # 相册
├── Blogs/                        # 日志
└── ...
```

---

## ⚠️ 仍需网络的内容

即使完成离线配置，以下内容仍可能需要网络：

| 内容 | 说明 | 解决方案 |
|------|------|---------|
| QQ 表情 | QQ 官方在线表情图片 | 无法离线化 |
| 未下载的图片 | 下载失败的图片 | 重新下载 |
| 未下载的视频 | 下载失败的视频 | 重新下载 |
| 外部链接 | 分享的外部网站内容 | 无法离线化 |

---

## 🔄 旧版本备份迁移

如果您有使用 v2.x 版本创建的备份文件（使用在线 CDN），可以按以下方式升级为离线版本：

### 方法一：重新备份（推荐）

使用 v3.0 版本重新进行备份，会自动生成离线版本。

### 方法二：手动复制离线资源

1. 从 v3.0 版本的新备份中复制 `Common/vendor` 文件夹

2. 粘贴到旧备份的 `Common` 目录下

3. 修改旧备份的 HTML 文件中的 CDN 链接

### 需要替换的链接

如果选择方法二，使用文本编辑器批量替换以下内容：

| 查找内容 | 替换为 |
|---------|--------|
| `https://cdn.staticfile.org/` 或 `https://cdn.jsdelivr.net/npm/` 开头的链接 | `../Common/vendor/` 对应路径 |

并删除 `integrity` 和 `crossorigin` 属性。

> 💡 **建议：** 直接使用方法一重新备份更简单可靠。

---

## 🔧 常见问题

### Q: 离线后页面仍然错乱？

**检查项：**
1. 确认使用的是 v3.0 或更高版本
2. 确认 `Common/vendor` 文件夹存在且完整
3. 确认 HTML 文件中的资源路径正确

### Q: 图片/视频不显示？

**可能原因：**
- 多媒体文件下载失败
- 文件夹未正确合并

**解决方案：**
1. 检查下载管理器中的失败任务
2. 重新下载失败的文件
3. 确保文案包和多媒体文件在同一目录

### Q: 备份迁移到其他电脑后无法查看？

**确保完整复制：**
- 整个备份文件夹
- 包含 `Common/vendor` 目录
- 保持目录结构不变

---

## 📞 获取帮助

如遇问题：

| 渠道 | 链接 |
|------|------|
| **GitHub Issues** | [提交问题](https://github.com/2015winter/QZoneExporter/issues) |
| **QQ 交流群** | 959828088 |

---

## 🔗 相关链接

- [安装教程](./install.md)
- [配置说明](./configuration.md)
- [使用指南](./usage.md)
- [常见问题](./faq.md)

---

*本文档适用于 v3.0 版本。v3.0 版本已默认支持离线查看，无需额外配置。*
