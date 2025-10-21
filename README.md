# LilyXUAN 个人网站

![Zola](https://img.shields.io/badge/Zola-静态网站生成器-FF7E0D)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages部署-F6820F)
![GitHub Actions](https://img.shields.io/badge/GitHub-Actions自动化部署-2088FF)

一个基于 Zola 静态网站生成器构建的个人博客与作品集网站，专注于技术分享、生活感悟和创意表达。

## ✨ 特性

- 🚀 **极速加载** - 基于 Zola 静态生成，页面加载速度快
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **优雅界面** - 简洁美观的设计风格
- 🔧 **技术栈**：
  - **框架**: Zola 静态网站生成器
  - **部署**: Cloudflare Pages + GitHub Actions
  - **域名**: lilyxuan.online
  - **主题**: 自定义主题，参考 Butterfly 设计理念

## 🛠️ 本地开发

### 环境要求
- Zola v0.17.2 或更高版本
- Git

### 安装与运行

1. **克隆项目**
```bash
git clone https://github.com/Li-zhienxuan/web_server.git
cd web_server
```

2. **本地预览**
```bash
zola serve
```
访问 `http://127.0.0.1:1111` 查看网站

3. **构建生产版本**
```bash
zola build
```

## 📁 项目结构

```
web_server/
├── config.toml          # 网站配置文件
├── content/             # 内容目录
│   ├── blog/           # 博客文章
│   └── pages/          # 静态页面
├── static/             # 静态资源
│   ├── images/         # 图片资源
│   └── css/           # 样式文件
├── templates/          # 模板文件
└── themes/             # 主题目录
```

## 🚀 部署流程

本网站使用自动化部署流程：

1. **代码推送** → 推送到 GitHub 仓库
2. **自动构建** → GitHub Actions 执行 Zola 构建
3. **部署上线** → 自动部署到 Cloudflare Pages
4. **域名访问** → 通过 lilyxuan.online 访问

### Cloudflare Pages 构建配置

**构建命令：**
```bash
wget -q https://github.com/getzola/zola/releases/download/v0.21.0/zola-v0.21.0-x86_64-unknown-linux-gnu.tar.gz && tar xzf zola-v0.21.0-x86_64-unknown-linux-gnu.tar.gz && ./zola build
```

**构建输出目录：** `public`

**环境变量：**
- `ZOLA_VERSION`: `0.21.0`

### 手动部署命令
```bash
zola build
git add .
git commit -m "更新描述"
git push origin main
```

## 🎯 功能模块

### 已完成功能
- ✅ 首页设计与布局
- ✅ 友链页面（支持分类、标签、卡片式展示）
- ✅ 响应式设计适配
- ✅ 深色/浅色主题切换
- ✅ 社交图标集成
- ✅ 自动化部署流程

### 规划功能
- 🔄 博客文章系统
- 🔄 项目作品展示
- 🔄 评论系统集成
- 🔄 搜索功能
- 🔄 多语言支持

## 🌐 访问地址

- **主站**: https://lilyxuan.online
- **备用地址**: https://web-server-3yx.pages.dev （需要魔法哦）
- **GitHub**: https://github.com/Li-zhienxuan

## 🤝 友链申请

欢迎交换友链！请确保您的网站：
- 内容健康积极
- 可正常访问
- 有本站的友链

友链格式：
```yaml
name: "您的昵称"
desc: "简短描述"
link: "网站地址"
icon: "头像链接"
tags: ["标签1", "标签2"]
```

## ❓ 常见问题

### Q: 图片无法显示？
A: 确保图片放在 `static/images/` 目录，HTML中使用 `/images/文件名` 路径

### Q: 本地构建失败？
A: 检查 config.toml 语法和主题配置，确保 Zola 版本一致

### Q: 部署后页面404？
A: 检查 base_url 配置和构建输出目录设置

### Q: Cloudflare Pages 构建失败？
A: 检查构建命令是否正确，确保 Zola 版本与构建命令中的版本一致

### Q: SSL证书问题？
A: Cloudflare 会自动处理 SSL，如遇问题检查 DNS 配置

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📞 联系我

- 📧 邮箱: Li.zhienxuan0516@gmail.com
- 🐱 GitHub: [Li-zhienxuan](https://github.com/Li-zhienxuan)
- 📺 Bilibili: [473911887](https://space.bilibili.com/473911887)

---

**星星点亮夜空，代码构建梦想** ✨

*感谢访问我的个人小站，期待与您在技术的海洋中相遇！*

---

*最后更新: 2025年10月21日*