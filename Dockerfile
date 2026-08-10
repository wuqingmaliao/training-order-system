# ==================== 构建阶段 ====================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies 用于构建）
# 使用 --ignore-scripts 跳过 postinstall 中的平台特定命令
RUN npm ci --ignore-scripts

# 复制源代码
COPY . .

# 构建 server 和 client
RUN npm run build:server && npm run build:client

# 移动 HTML 文件到正确位置（参考 build.sh 逻辑）
RUN mkdir -p dist/dist/client && \
    find dist/client -maxdepth 1 -name "*.html" -exec mv {} dist/dist/client/ \; || true

# ==================== 运行阶段 ====================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

# 安装 PostgreSQL 客户端（用于健康检查和等待数据库）
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 创建非 root 用户
RUN groupadd -r appuser && useradd -r -g appuser -d /app -s /sbin/nologin appuser

# 复制构建产物（dist 目录包含所有运行时文件）
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# 复制 docker 入口脚本
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# 创建日志目录
RUN mkdir -p ./logs && chown -R appuser:appuser /app

USER appuser

EXPOSE 3000

ENV NODE_ENV=production
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=3000

# 从 dist 目录启动（与平台运行方式一致）
WORKDIR /app/dist

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "server/main.js"]
