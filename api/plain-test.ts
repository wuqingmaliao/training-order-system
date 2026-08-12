export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    msg: 'plain function works',
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
    },
    time: new Date().toISOString(),
  });
}
