@echo off
chcp 65001 >nul
title 培训订单管理系统 - 停止服务

echo =========================================
echo   停止培训订单管理系统
echo =========================================
echo.

docker compose down

echo.
echo ✅ 服务已停止
echo.
echo 提示: 数据已保存在 Docker 卷中，下次启动不会丢失
echo       如需完全清除数据，运行: docker compose down -v
echo.
pause
