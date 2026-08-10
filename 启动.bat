@echo off
chcp 65001 >nul
title 培训订单管理系统

echo ========================================
echo   培训订单管理系统
echo ========================================
echo.

cd /d "%~dp0"

:: 检查Node.js是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js！
    echo.
    echo 请先安装Node.js（只需要安装一次）：
    echo 下载地址: https://nodejs.org/
    echo 下载LTS版本，安装时一路下一步即可
    echo.
    pause
    exit /b 1
)

:: 检查是否已构建
if not exist "dist\server\main.js" (
    echo [提示] 首次运行，正在构建应用，请稍候...
    echo.
    call npm install --legacy-peer-deps
    call npm run build:server
    call npm run build:client
    echo.
    echo 构建完成！
    echo.
)

:: 设置环境变量
set NODE_ENV=production
set SERVER_HOST=0.0.0.0
set SERVER_PORT=3000
set ADMIN_PASSWORD=admin123

echo ========================================
echo   服务已启动！
echo ========================================
echo.
echo   订单填写页面: http://localhost:3000
echo   管理后台登录: http://localhost:3000/admin/login
echo   管理员密码:   admin123
echo.
echo   局域网访问: http://你的IP:3000
echo.
echo   按 Ctrl+C 可停止服务
echo ========================================
echo.

node dist/server/main.js

echo.
echo 服务已停止
pause
