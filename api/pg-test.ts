const { Pool } = require('pg');

export default async function handler(req: any, res: any) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return res.status(500).json({ error: 'DATABASE_URL not set' });
  }

  // 先返回已收到请求，然后测试连接
  res.writeHead(200, { 'Content-Type': 'application/json' });

  try {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    });

    const result = await pool.query('SELECT current_database() as db, current_user as usr');
    await pool.end();

    res.end(JSON.stringify({
      success: true,
      db: result.rows[0].db,
      user: result.rows[0].usr,
    }));
  } catch (err: any) {
    res.end(JSON.stringify({
      error: err.message,
      code: err.code,
      stack: err.stack?.substring(0, 800),
    }));
  }
}
