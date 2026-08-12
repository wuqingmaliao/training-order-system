const { Pool } = require('pg');

export default async function handler(req: any, res: any) {
  // 连接池地址（IPv4）
  const connectionString = 'postgresql://postgres.jynhabpdjjpkadoajag:123..lqwlqw..@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

  try {
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    const result = await pool.query('SELECT current_database() as db, current_user as usr');
    await pool.end();

    res.status(200).json({
      success: true,
      db: result.rows[0].db,
      user: result.rows[0].usr,
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      code: err.code,
      stack: err.stack?.substring(0, 800),
    });
  }
}
