export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    message: 'Vercel function works',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    time: new Date().toISOString(),
  });
}
