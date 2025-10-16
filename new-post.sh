#!/bin/bash

if [ -z "$1" ]; then
    echo "使用方法: ./new-post.sh '文章标题'"
    exit 1
fi

# 生成文件名（中文转拼音，或使用英文）
FILENAME=$(echo "$1" | tr ' ' '-' | tr -cd '[:alnum:]-').md
DATE=$(date +%Y-%m-%d)

cat > "content/posts/$FILENAME" << POST
+++
title = "$1"
date = $DATE
description = ""
[taxonomies]
tags = []
categories = []
+++

# $1

开始撰写你的内容...

## 章节标题

正文内容...

POST

echo "✅ 创建新文章: content/posts/$FILENAME"
echo "📝 使用编辑器打开: nano content/posts/$FILENAME"
