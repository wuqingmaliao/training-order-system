import * as crypto from 'crypto';

let cachedPassword: string | null = null;

/**
 * 获取管理员密码：
 * 1. 优先读 ADMIN_PASSWORD 环境变量
 * 2. 未设置则随机生成一个，打印到控制台（Vercel Logs 可查看）
 */
export function getAdminPassword(): string {
  if (cachedPassword) return cachedPassword;

  const fromEnv = process.env.ADMIN_PASSWORD;
  if (fromEnv && fromEnv.trim()) {
    cachedPassword = fromEnv.trim();
    return cachedPassword;
  }

  // 随机生成 12 位密码
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let pw = '';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    pw += chars[bytes[i] % chars.length];
  }
  cachedPassword = pw;

  // 打印到日志，部署后在 Vercel Logs 中查看
  console.warn('========================================');
  console.warn('[初始化] 未设置 ADMIN_PASSWORD 环境变量，已随机生成管理员密码：');
  console.warn(`[初始化] 用户名: admin`);
  console.warn(`[初始化] 密码: ${cachedPassword}`);
  console.warn('[初始化] 请尽快在环境变量中设置 ADMIN_PASSWORD 以固定密码');
  console.warn('========================================');

  return cachedPassword;
}
