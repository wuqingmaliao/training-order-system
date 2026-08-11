# Vercel + Supabase 部署指南

## 架构说明

- **前端**：React + Vite，构建后由 Vercel CDN 提供静态文件服务
- **后端**：NestJS，运行在 Vercel Serverless Functions 上
- **数据库**：PostgreSQL，由 Supabase 提供（免费额度）

## 第一步：注册 Supabase 并创建数据库

1. 访问 https://supabase.com ，用 GitHub 账号登录
2. 点击 **New Project**，填写：
   - Name: `training-order`（随意）
   - Database Password: 设置一个强密码并**记下来**
   - Region: 选离你最近的（如 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`）
3. 等待约 2 分钟，项目创建完成
4. 左侧菜单进入 **SQL Editor**，点击 **New query**
5. 将项目根目录下 `supabase-schema.sql` 的全部内容粘贴进去，点击 **Run**
6. 左侧菜单进入 **Project Settings** → **Database**，找到 **Connection string**：
   - 选择 **URI** 格式
   - 复制连接字符串，格式类似：
     `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
   - 把 `[YOUR-PASSWORD]` 替换为你刚才设置的数据库密码

## 第二步：推送代码到 GitHub

如果还没有 GitHub 仓库：

```bash
cd D:\29239\ForWork\app\app_17btu6ueem0
git init
git add .
git commit -m "Vercel + Supabase 部署改造"
git branch -M main
git remote add origin https://github.com/你的用户名/training-order-system.git
git push -u origin main
```

## 第三步：在 Vercel 导入项目

1. 访问 https://vercel.com ，用 GitHub 账号登录
2. 点击 **Add New** → **Project**
3. 在 Import Git Repository 中找到你的仓库，点击 **Import**
4. 配置项目：
   - **Framework Preset**: 选 `Other`（不要选 Vite，因为我们有自定义构建命令）
   - **Build Command**: 已在 `vercel.json` 中配置，无需修改
   - **Output Directory**: 已在 `vercel.json` 中配置，无需修改
   - **Install Command**: `npm install --legacy-peer-deps`
5. 展开 **Environment Variables**，添加：
   - `DATABASE_URL` = 你在 Supabase 复制的连接字符串
   - `TOKEN_SECRET` = 任意随机字符串（用于 JWT 签名，建议用密码生成器生成）
   - `NODE_ENV` = `production`
6. 点击 **Deploy**，等待 2-3 分钟构建完成

## 第四步：验证部署

1. 部署成功后，Vercel 会给你一个域名，如 `https://training-order-xxx.vercel.sh`
2. 访问该域名，应该能看到首页
3. 点击管理员入口，用 `admin` / `admin123` 登录
4. 测试注册、登录、创建订单等功能

## 本地开发

本地开发仍然使用 SQLite，无需任何额外配置：

```bash
# 直接双击 start.bat，或：
npm run build:client
npm run start
```

如果想在本地连接 Supabase 测试：

```powershell
$env:DATABASE_URL="postgresql://postgres:密码@db.xxx.supabase.co:5432/postgres"
npm run start
```

## 常见问题

### 构建失败
- 检查 Vercel 的 Build Logs，通常是 TypeScript 编译错误
- 确保 `npm install --legacy-peer-deps` 作为 Install Command

### 数据库连接失败
- 确认 Supabase 项目状态正常（没有暂停）
- 确认 `DATABASE_URL` 格式正确，密码已替换
- Supabase 免费项目 7 天不访问会自动暂停，访问一次即可恢复

### API 404
- 确认 `vercel.json` 的 rewrites 配置正确
- 检查 Vercel Functions 是否部署成功（Deployments → Functions 标签页）

### 静态资源 404
- 检查 Output Directory 是否为 `dist/client`
- 检查 Vite 构建是否成功

## 文件变更说明

| 文件 | 说明 |
|------|------|
| `server/database/pg-schema.ts` | 新增：PostgreSQL 版 Drizzle schema |
| `server/database/pg.module.ts` | 新增：PostgreSQL 连接模块 |
| `server/database/database.module.ts` | 新增：根据环境变量自动选择数据库 |
| `server/database/schema.ts` | 新增：统一 schema 导出 |
| `server/database/db-helper.ts` | 新增：同步/异步查询兼容层 |
| `api/index.ts` | 新增：Vercel Serverless 入口 |
| `vercel.json` | 新增：Vercel 部署配置 |
| `supabase-schema.sql` | 新增：Supabase 建表脚本 |
| `server/database/sqlite.module.ts` | 修改：统一注入 token 为 DB_TOKEN |
| `server/app.module.ts` | 修改：Vercel 环境不加载 ViewModule |
| `server/modules/*/` | 修改：所有 service 支持双数据库 |
