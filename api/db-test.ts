import postgres from 'postgres';

export default async function handler(req: any, res: any) {
  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    const sql = postgres(connectionString, {
      max: 1,
      ssl: 'require',
      prepare: false,
      connect_timeout: 10,
    });

    const result = await sql`SELECT current_database() as db, current_user as user, version() as version`;
    await sql.end();

    res.status(200).json({
      success: true,
      db: result[0].db,
      user: result[0].user,
      version: result[0].version,
    });
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      code: err.code,
      stack: err.stack?.substring(0, 1000),
    });
  }
}
