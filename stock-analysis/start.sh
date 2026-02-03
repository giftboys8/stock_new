#!/bin/bash

# 中国风股票分析系统 - 快速启动脚本

echo "🎨 中国风股票分析系统 - 快速启动"
echo "======================================"
echo ""

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 stock-analysis 目录中运行此脚本"
    echo ""
    echo "请运行："
    echo "  cd /opt/AI/stock/stock-analysis"
    echo "  ./start.sh"
    exit 1
fi

echo "✅ 当前目录正确"
echo ""

# 检查上级目录是否有错误的node_modules
if [ -d "../node_modules" ]; then
    echo "⚠️  检测到上级目录有node_modules，正在删除..."
    rm -rf ../node_modules ../package-lock.json
    echo "✅ 清理完成"
    echo ""
fi

# 检查是否需要安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    echo ""
fi

# 启动开发服务器
echo "🚀 正在启动开发服务器..."
echo ""
npm run dev
