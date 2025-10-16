#!/bin/bash
echo "📁 目录结构检查"
echo "==============="

echo "Zola 项目目录: /var/www/zola/public"
if [ -d "/var/www/zola" ]; then
    echo "✅ 存在"
    echo "   内容文件: $(find /var/www/zola/content -name "*.md" 2>/dev/null | wc -l) 个"
    echo "   最后修改: $(ls -ld /var/www/zola/content 2>/dev/null | awk '{print $6, $7, $8}')"
else
    echo "❌ 不存在"
fi

echo ""
echo "网站目标目录: /var/www/lilyxuan.online"
if [ -d "/var/www/lilyxuan.online" ]; then
    echo "✅ 存在"
    echo "   当前文件: $(find /var/www/lilyxuan.online -name "*.html" 2>/dev/null | wc -l) 个"
    echo "   最后修改: $(ls -ld /var/www/lilyxuan.online 2>/dev/null | awk '{print $6, $7, $8}')"
else
    echo "❌ 不存在"
fi

echo ""
echo "Nginx 服务状态:"
systemctl is-active nginx >/dev/null 2>&1 && echo "✅ 运行中" || echo "❌ 未运行"
