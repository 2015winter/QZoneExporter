# QQ空间导出助手 - 安装教程

> **Installation Guide for QZone Exporter**

---

## 📋 安装前提

在开始安装前，请确保您的环境满足以下条件：

| 要求 | 说明 |
|------|------|
| **浏览器类型** | 基于 Chromium 内核的浏览器 |
| **内核版本** | Chromium 88+（Manifest V3 要求） |
| **扩展支持** | 浏览器需支持 Manifest V3 扩展 |

### 支持的浏览器

| 浏览器 | 支持状态 | 备注 |
|--------|---------|------|
| Google Chrome | ✅ 完全支持 | 推荐使用 |
| Microsoft Edge | ✅ 完全支持 | 推荐使用 |
| 360极速浏览器 | ✅ 支持 | 需切换至极速模式 |
| 360安全浏览器 | ✅ 支持 | 需切换至极速模式 |
| 百分浏览器 | ✅ 支持 | - |
| Opera | ✅ 支持 | - |
| Brave | ✅ 支持 | - |
| Firefox | ❌ 不支持 | 非 Chromium 内核 |
| Safari | ❌ 不支持 | 非 Chromium 内核 |

---

## 🚀 安装方式

### 方式一：应用商店安装（推荐）

**优点：** 安装简单，支持自动更新

#### Chrome 网上应用店

1. 访问 [Chrome 网上应用店](https://chrome.google.com/webstore/detail/aofadimegphfgllgjblddapiaojbglhf)
2. 点击「添加至 Chrome」
3. 确认安装权限

> ⚠️ **注意：** 需要科学上网才能访问 Chrome 网上应用店

#### Microsoft Edge 扩展商店

1. 访问 [Edge 扩展商店](https://microsoftedge.microsoft.com/addons/detail/djfalpkpjgpkfnkfmnegbalnicdoljcn)
2. 点击「获取」
3. 确认安装权限

#### 360 扩展商店

1. 访问 [360 扩展中心](https://ext.chrome.360.cn/webstore/detail/dboplopmhoafmbcbmcecapkmcodhcegh)
2. 点击「安装」
3. 确认安装权限

---

### 方式二：离线安装（开发者模式）

**优点：** 不需要科学上网，兼容性强  
**缺点：** 需手动更新

#### 步骤 1：下载源码

从以下任一渠道下载最新版本：

| 渠道 | 链接 | 说明 |
|------|------|------|
| **GitHub** | [Releases](https://github.com/2015winter/QZoneExporter/releases) | 推荐，需科学上网 |
| **GitHub 源码** | [下载 ZIP](https://github.com/2015winter/QZoneExporter/archive/refs/heads/main.zip) | 下载后解压 |

#### 步骤 2：解压文件

1. 将下载的 ZIP 文件解压到任意目录
2. **记住解压后的文件夹路径**（后续需要用到）
3. 确保文件夹中包含 `src` 目录或 `manifest.json` 文件

```
解压后的目录结构示例：
QZoneExporter/
├── src/
│   ├── manifest.json  ← 这是扩展的配置文件
│   ├── js/
│   ├── html/
│   └── ...
├── README.md
└── ...
```

#### 步骤 3：打开扩展管理页面

在浏览器地址栏输入对应的扩展管理地址：

| 浏览器 | 地址 |
|--------|------|
| Chrome | `chrome://extensions/` |
| Edge | `edge://extensions/` |
| 360浏览器 | `se://extensions/` |
| 其他 Chromium | `chrome://extensions/` |

#### 步骤 4：开启开发者模式

在扩展管理页面，找到并开启 **「开发者模式」** 开关（通常位于页面右上角）。

#### 步骤 5：加载扩展

1. 点击 **「加载已解压的扩展程序」** 按钮
2. 选择步骤 2 中解压的 **`src` 文件夹**（包含 `manifest.json` 的目录）
3. 点击「选择文件夹」确认

> ⚠️ **常见错误：** 如果选择了外层目录而非 `src` 目录，会提示找不到 manifest.json

#### 步骤 6：验证安装

安装成功后：

1. 扩展列表中会出现「QQ空间导出助手」
2. 浏览器工具栏会显示助手图标
3. **建议重启浏览器**以确保功能正常

---

## 🔧 安装后配置

### 固定扩展图标（推荐）

为方便使用，建议将助手图标固定到工具栏：

1. 点击浏览器工具栏的「扩展」按钮（拼图图标）
2. 找到「QQ空间导出助手」
3. 点击图钉图标将其固定

### 配置助手

首次使用前，建议先进行配置：

1. 右键点击助手图标
2. 选择「选项」或「扩展选项」
3. 根据需要调整配置项
4. 点击「保存」

详细配置说明请参考 [配置文档](./configuration.md)

---

## ❓ 常见问题

### Q: 提示「manifest.json 文件缺失或不可读」

**解决方案：** 确保选择的是包含 `manifest.json` 的 `src` 目录，而非外层目录。

### Q: 安装后图标不显示

**解决方案：** 
1. 重启浏览器
2. 检查扩展是否已启用
3. 将图标固定到工具栏

### Q: 离线安装后无法自动更新

**解决方案：** 离线安装的扩展需要手动更新：
1. 下载新版本源码
2. 解压并覆盖旧文件
3. 在扩展管理页面点击「重新加载」

### Q: 提示「无法加载扩展程序」

**可能原因：**
1. 浏览器版本过低（需 Chromium 88+ 以支持 Manifest V3）
2. 开发者模式未开启
3. 文件夹路径包含中文或特殊字符
4. 浏览器不支持 Service Worker

**解决方案：** 更新浏览器到最新版本 / 开启开发者模式 / 将文件夹移动到纯英文路径

---

## 📱 移动端说明

助手主要面向 PC 端浏览器设计。移动端使用需满足：

1. 使用支持扩展的浏览器（如 Kiwi Browser、Yandex Browser）
2. 按照离线安装方式加载扩展
3. 可能存在兼容性问题，建议优先使用 PC 端

---

## 🔗 相关链接

- [配置说明](./configuration.md)
- [使用指南](./usage.md)
- [常见问题](./faq.md)
- [隐私政策](./privacy-policy.md)

---

*本文档适用于 v3.0 版本（Manifest V3）。*
