#!/bin/bash
set -e

echo "🚀 Zola 网站部署脚本"
echo "===================="

# 定义目录
ZOLA_DIR="/var/www/zola"
TARGET_DIR="/var/www/lilyxuan.online"
BACKUP_DIR="/var/www/backups/$(date +%Y%m%d_%H%M%S)"

# 显示目录信息
echo "📁 源目录: $ZOLA_DIR"
echo "🎯 目标目录: $TARGET_DIR"
echo "💾 备份目录: $BACKUP_DIR"

# 检查目标目录是否存在
if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ 错误: 目标目录 $TARGET_DIR 不存在"
    exit 1
fi

# 确认操作
echo ""
echo "⚠️  警告: 此操作将删除 $TARGET_DIR 中除 images 文件夹外的所有文件!"
read -p "❓ 确定要继续吗? (y/N): " confirm
[[ ! $confirm =~ ^[Yy]$ ]] && { echo "❌ 部署已取消"; exit 0; }

# 创建备份
echo ""
echo "💾 创建备份..."
sudo mkdir -p "$BACKUP_DIR"
sudo cp -r "$TARGET_DIR"/* "$BACKUP_DIR"/ 2>/dev/null || echo "⚠️  备份目录为空或备份失败（继续部署）"

# 构建网站
echo ""
echo "🔨 构建静态网站..."
cd "$ZOLA_DIR"

# 自动构建，如果失败则提示
if ! zola build; then
    echo "❌ Zola 构建失败，请检查内容后重试"
    exit 1
fi

# 检查构建结果
if [ ! -d "$ZOLA_DIR/public" ]; then
    echo "❌ 构建成功但 public 目录未生成，请检查构建过程"
    exit 1
fi

echo "✅ 构建成功，开始部署..."

# 部署新文件
echo "🗑️  清空目标目录（保留 images）..."
sudo find "$TARGET_DIR" -mindepth 1 -maxdepth 1 ! -name "images" -exec rm -rf {} +

echo "📋 复制新文件..."
sudo cp -r "$ZOLA_DIR"/public/* "$TARGET_DIR"/

# 设置权限
echo "🔒 设置文件权限..."
sudo chown -R www-data:www-data "$TARGET_DIR"
sudo find "$TARGET_DIR" -type f -exec chmod 644 {} \;
sudo find "$TARGET_DIR" -type d -exec chmod 755 {} \;

# 重新加载 Nginx
echo "🔄 重新加载 Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ 部署完成!"
echo "🌐 网站地址: https://lilyxuan.online"
echo "📁 备份位置: $BACKUP_DIR"
echo ""
echo "📊 部署统计:"
echo "   生成页面: $(find "$TARGET_DIR" -name "*.html" | wc -l)"
echo "   部署时间: $(date)"