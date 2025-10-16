#!/bin/bash

if [ -z "$1" ]; then
    echo "使用方法: ./new-post-smart.sh '文章标题'"
    exit 1
fi

# 生成安全的文件名（中文保留，特殊字符替换）
safe_filename() {
    echo "$1" | sed -e 's/[()（）【】！!@#$%^&*]/ /g' -e 's/  */ /g' -e 's/^ *//' -e 's/ *$//' | tr ' ' '-'
}

TITLE="$1"
FILENAME=$(safe_filename "$TITLE").md
DATE=$(date +%Y-%m-%d)

# 创建带前置元数据的文章
cat > "content/posts/$FILENAME" << CONTENT
+++
title = "$TITLE"
date = $DATE
description = ""
[taxonomies]
tags = []
categories = []
+++

# $TITLE

开始撰写你的内容...

## 章节标题

正文内容...
CONTENT

echo "✅ 创建新文章: content/posts/$FILENAME"
echo "📝 使用编辑器打开: nano content/posts/$FILENAME"
