#!/bin/bash
echo "🔧 深度修复重复键错误..."

cd /var/www/zola

echo "1. 备份原文件..."
cp content/posts/_index.md content/posts/_index.md.backup 2>/dev/null || true

echo "2. 完全删除原文件..."
rm -f content/posts/_index.md

echo "3. 使用安全方法重新创建文件..."
{
    echo "+++"
    echo "title = \"记录\""
    echo "sort_by = \"date\""
    echo "template = \"posts.html\""
    echo "+++"
    echo ""
    echo "这里是我的博客文章记录。"
} > content/posts/_index.md

echo "4. 验证文件内容..."
echo "=== 文本内容 ==="
cat content/posts/_index.md
echo "=== 十六进制内容 ==="
hexdump -C content/posts/_index.md | head -10

echo "5. 清理 Zola 缓存..."
rm -rf public/ .zola-cache/ 2>/dev/null || true

echo "6. 构建测试..."
zola build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
    echo "7. 部署..."
    ./deploy.sh
else
    echo "❌ 构建失败"
    echo "尝试不使用模板..."
    cat > content/posts/_index.md << 'INDEX'
+++
title = "记录"
sort_by = "date"
+++

这里是我的博客文章记录。
INDEX
    zola build && ./deploy.sh
fi
