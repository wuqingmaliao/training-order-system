@echo off
chcp 65001 >nul 2>&1
title 培训订单管理系统

echo ========================================
echo   培训订单管理系统 启动中...
echo ========================================
echo.

:: 检查并关闭占用3000端口的旧进程
echo [1/3] 检查端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    echo       发现旧进程 PID: %%a，正在关闭...
    taskkill /F /PID %%a >nul 2>&1
)
echo       端口检查完成。
echo.

:: 进入项目目录
cd /d "%~dp0"

:: 检查是否需要构建
if not exist "dist\server\main.js" (
    echo [2/3] 首次运行，正在构建项目...
    call node node_modules\@nestjs\cli\bin\nest.js build
    call node node_modules\vite\bin\vite.js build --config vite.config.ts
    echo       构建完成。
) else (
    echo [2/3] 项目已构建，跳过构建步骤。
)
echo.

:: 启动服务器
echo [3/3] 启动服务器...
echo.
echo ========================================
echo   系统已启动！
echo   员工入口: http://localhost:3000
echo   管理后台: http://localhost:3000/admin/login
echo   默认管理员: admin / admin123
echo ========================================
echo.
echo 按 Ctrl+C 可停止服务器。
echo.

set NODE_ENV=production
set SERVER_HOST=0.0.0.0
set SERVER_PORT=3000
node dist/server/main.js

:: 如果服务器异常退出，暂停以便查看错误
echo.
echo 服务器已停止。
pause
