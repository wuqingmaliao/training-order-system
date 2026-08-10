#!/bin/bash
set -e

echo "========================================="
echo "  培训订单管理系统 - 启动中..."
echo "========================================="

# 等待数据库就绪
if [ -n "$SUDA_DATABASE_URL" ]; then
    echo "[1/3] 等待数据库连接..."

    # 解析 SUDA_DATABASE_URL
    # 格式: postgresql://user:password@host:port/dbname
    DB_USER=$(echo $SUDA_DATABASE_URL | sed -e 's/^postgresql:\/\///' -e 's/:.*//')
    DB_HOST=$(echo $SUDA_DATABASE_URL | sed -e 's/^postgresql:\/\/[^:]*:[^@]*@//' -e 's/:.*//')
    DB_PORT=$(echo $SUDA_DATABASE_URL | sed -e 's/^postgresql:\/\/[^:]*:[^@]*@[^:]*://' -e 's/\/.*//')
    DB_NAME=$(echo $SUDA_DATABASE_URL | sed -e 's/^.*\///' -e 's/?.*//')

    RETRIES=30
    until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
        echo "  等待数据库就绪... ($((30-RETRIES))/30)"
        RETRIES=$((RETRIES-1))
        sleep 2
    done

    if [ $RETRIES -eq 0 ]; then
        echo "❌ 数据库连接超时，请检查配置"
        exit 1
    fi

    echo "✅ 数据库连接成功"
else
    echo "[1/3] 未配置数据库连接，跳过数据库等待"
fi

echo "[2/3] 启动应用服务..."
echo "[3/3] 服务启动完成！"
echo ""
echo "========================================="
echo "  ✅ 系统启动成功！"
echo "  访问地址: http://localhost:3000"
echo "  管理后台: http://localhost:3000/admin/login"
echo "  默认密码: ${ADMIN_PASSWORD:-admin123}"
echo "========================================="
echo ""

# 执行主命令
exec "$@"
