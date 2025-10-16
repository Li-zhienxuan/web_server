#!/bin/bash
echo "🔄 批量修复所有文章的前置元数据..."

cd /var/www/zola

# 计数器
fixed_count=0
total_count=0

# 处理所有文章
find content/posts/ -name "*.md" | while read file; do
    total_count=$((total_count + 1))
    echo "处理: $(basename "$file")"
    
    # 检查是否已有前置元数据
    if head -1 "$file" | grep -q -E "^\+\+\+$|^\-\-\-$"; then
        echo "  ✅ 已有前置元数据"
        continue
    fi
    
    # 修复缺失前置元数据的文件
    fixed_count=$((fixed_count + 1))
    
    # 备份
    cp "$file" "$file.backup"
    
    # 提取可能的标题（第一行内容）
    first_line=$(head -1 "$file" | sed 's/^# //')
    if [ -z "$first_line" ] || [ "$first_line" = "$(head -1 "$file")" ]; then
        # 如果没有找到标题，使用文件名
        title=$(basename "$file" .md)
    else
        title="$first_line"
    fi
    
    # 提取可能的日期（从文件名或备份中）
    file_date=$(date -r "$file" +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)
    
    # 创建新文件
    {
        echo "+++"
        echo "title = \"$title\""
        echo "date = $file_date"
        echo "+++"
        echo ""
        # 跳过可能的原标题行
        if echo "$first_line" | grep -q "^# "; then
            tail -n +2 "$file.backup"
        else
            cat "$file.backup"
        fi
    } > "$file"
    
    echo "  🔧 已修复"
done

echo ""
echo "📊 修复统计:"
echo "   总文章数: $total_count"
echo "   修复文章数: $fixed_count"
echo ""
echo "开始构建测试..."
zola build && echo "✅ 所有文章修复完成！" || echo "❌ 构建失败"
