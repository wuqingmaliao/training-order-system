export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 30) + '...' : null,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    time: new Date().toISOString(),
  });
}
