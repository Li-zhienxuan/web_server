#!/bin/bash
echo "🔧 自动修复缺失的前置元数据..."

cd /var/www/zola

# 查找所有 Markdown 文件并检查前置元数据
find content/ -name "*.md" | while read file; do
    echo "检查: $file"
    
    # 检查文件是否以 +++ 或 --- 开头（前置元数据）
    if ! head -1 "$file" | grep -q -E "^\+\+\+$|^\-\-\-$"; then
        echo "  ❌ 缺少前置元数据，正在修复..."
        
        # 备份原文件
        cp "$file" "$file.backup"
        
        # 获取文件名（不带扩展名）作为标题
        filename=$(basename "$file" .md)
        
        # 创建带前置元数据的新文件
        {
            echo "+++"
            echo "title = \"$filename\""
            echo "date = $(date +%Y-%m-%d)"
            echo "+++"
            echo ""
            cat "$file.backup"
        } > "$file"
        
        echo "  ✅ 已修复: $file"
    else
        echo "  ✅ 前置元数据正常"
    fi
done

echo ""
echo "修复完成！开始构建测试..."
zola build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！可以部署了"
else
    echo "❌ 构建失败，请检查错误信息"
fi
