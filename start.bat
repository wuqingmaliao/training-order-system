@echo off
chcp 65001 >nul
title 培训订单管理系统 - 一键启动

echo =========================================
echo   培训订单管理系统 - 一键启动脚本
echo =========================================
echo.

:: 检查 Docker 是否安装
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Docker，请先安装 Docker Desktop
    echo.
    echo 下载地址: https://www.docker.com/products/docker-desktop/
    echo 安装后重启电脑再运行此脚本
    echo.
    pause
    exit /b 1
)

:: 检查 Docker 是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [提示] Docker 未启动，正在启动 Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo 等待 Docker 启动中，请稍候...
    timeout /t 30 /nobreak >nul
)

echo [1/4] 检查 Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Docker Compose 不可用，请更新 Docker Desktop
    pause
    exit /b 1
)
echo       Docker Compose 就绪

echo.
echo [2/4] 构建应用镜像（首次运行需要几分钟）...
docker compose build
if %errorlevel% neq 0 (
    echo.
    echo [错误] 镜像构建失败，请检查网络连接
    pause
    exit /b 1
)

echo.
echo [3/4] 启动服务...
docker compose up -d
if %errorlevel% neq 0 (
    echo.
    echo [错误] 服务启动失败
    pause
    exit /b 1
)

echo.
echo [4/4] 等待服务就绪...
timeout /t 10 /nobreak >nul

echo.
echo =========================================
echo   ✅ 系统启动成功！
echo =========================================
echo.
echo   客户填写表单: http://localhost:3000
echo   管理后台登录: http://localhost:3000/admin/login
echo   管理员密码:   admin123
echo.
echo   提示: 把 localhost 换成这台电脑的 IP 地址，
echo         同一局域网内的其他人就能访问了
echo.
echo   查看运行状态: docker compose ps
echo   停止服务:     双击 stop.bat
echo.
echo =========================================
echo.

:: 自动打开浏览器
start http://localhost:3000

pause
