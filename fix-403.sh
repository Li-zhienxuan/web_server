#!/bin/bash
echo "🛠️ 开始修复 403 错误..."

echo "1. 修复权限..."
sudo chown -R www-data:www-data /var/www/lilyxuan.online
sudo find /var/www/lilyxuan.online -type f -exec chmod 644 {} \;
sudo find /var/www/lilyxuan.online -type d -exec chmod 755 {} \;

echo "2. 构建网站..."
cd /var/www/zola
zola build

echo "3. 检查生成的文件..."
if [ -d "public/posts" ]; then
    echo "✅ posts 目录已生成"
    ls -la public/posts/ | head -5
else
    echo "❌ posts 目录未生成"
fi

echo "4. 重新部署..."
sudo rm -rf /var/www/lilyxuan.online/*
sudo cp -r public/* /var/www/lilyxuan.online/

echo "5. 重启 Nginx..."
sudo systemctl reload nginx

echo "✅ 修复完成"
echo "🌐 请访问: https://lilyxuan.online/posts/"
