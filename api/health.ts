export default function handler(req: any, res: any) {
  const url = process.env.DATABASE_URL || '';
  // 提取主机名部分（@后面到:或/之前）
  let host = 'not set';
  if (url) {
    const match = url.match(/@([^:/]+)/);
    host = match ? match[1] : 'parse failed';
  }
  res.status(200).json({
    ok: true,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    dbHost: host,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    time: new Date().toISOString(),
  });
}
