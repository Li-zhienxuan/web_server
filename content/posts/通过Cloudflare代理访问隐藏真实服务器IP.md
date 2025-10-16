+++
title = "通过Cloudflare代理访问隐藏真实服务器IP"
date = 2025-10-14
+++


# 网站通过 Cloudflare 访问并隐藏真实服务器 IP 的部署指南

部署人：XUAN  
部署时间：2025年10月01日 星期三  
服务器位置：香港荃湾  
域名服务商：腾讯云（有效期一年）  
目标：使用 Cloudflare 作为反向代理，隐藏真实服务器 IP，保护网站安全

---

## 一、准备工作

- 已部署的网站（如天气网站）运行在 Ubuntu Server 上，使用 Apache 或 Nginx
- 已拥有腾讯云注册的域名（如 `example.com`）
- 已注册并登录 Cloudflare 账户

---

## 二、将域名接入 Cloudflare

### 1. 添加网站到 Cloudflare

登录 Cloudflare → 添加站点 → 输入你的域名（如 `example.com`）→ 选择免费计划 → 继续

### 2. 配置 DNS 记录

在 Cloudflare 的 DNS 页面添加以下记录：

| 类型 | 名称 | 内容（IP地址） | 代理状态 |
|------|------|----------------|-----------|
| A    | @    | 你的服务器公网IP | 开启代理（橙色云朵） |
| A    | www  | 同上             | 开启代理（橙色云朵） |

确保“代理状态”为橙色云朵图标，表示启用 Cloudflare 代理。

### 3. 修改腾讯云域名的 DNS 服务器

登录腾讯云 → 域名管理 → 修改 DNS → 替换为 Cloudflare 提供的两组 NS 服务器，例如：

```
lisa.ns.cloudflare.com  
tom.ns.cloudflare.com
```

DNS 修改后可能需要等待几分钟至数小时生效。

---

## 三、隐藏真实服务器 IP 的关键配置

### 1. 确保 DNS 记录开启代理

在 Cloudflare 的 DNS 页面，所有 A 记录必须启用代理（橙色云朵），否则访问者将直接看到你的服务器 IP。

### 2. 禁止直接访问服务器 IP

在服务器防火墙中只允许 Cloudflare IP 段访问 80/443 端口：

#### 获取 Cloudflare IP 段

```bash
curl https://www.cloudflare.com/ips-v4
curl https://www.cloudflare.com/ips-v6
```

#### 使用 UFW 设置规则（Ubuntu）

```bash
ufw default deny incoming
ufw allow ssh
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  ufw allow from $ip to any port 80
  ufw allow from $ip to any port 443
done
ufw enable
```

这样只有 Cloudflare 能访问你的网站，其他人无法通过真实 IP 访问。

---

## 四、启用 HTTPS（推荐）

在 Cloudflare → SSL/TLS → 选择“完全（Strict）”模式  
并在服务器上安装有效的 SSL 证书（如 Let’s Encrypt）

---

## 五、验证是否隐藏真实 IP

### 方法一：使用在线工具检测

访问 [https://securitytrails.com](https://securitytrails.com) 或 [https://dnschecker.org](https://dnschecker.org)，输入你的域名，确认解析 IP 为 Cloudflare 的节点，而非你的服务器 IP。

### 方法二：直接 ping 域名

```bash
ping example.com
```

返回的 IP 应为 Cloudflare 的 CDN 节点，而不是你的服务器公网 IP。

---

## ✅ 部署完成

- 网站已通过 Cloudflare 访问  
- 真实服务器 IP 已隐藏  
- 腾讯云域名已接入 Cloudflare  
- 防火墙已限制仅允许 Cloudflare IP 访问  
- 可选：启用 HTTPS 提升安全性

---

## 📄 附加建议

- 定期检查 DNS 记录是否仍启用代理  
- 不要在任何地方暴露服务器真实 IP（如邮件签名、Git 提交等）  
- 可使用 Fail2Ban 或 WAF 增强安全防护