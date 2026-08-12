const crypto = require('crypto');

export default function handler(req: any, res: any) {
  try {
    // 测试内置模块
    const hash = crypto.createHash('sha256').update('test').digest('hex');

    // 测试require第三方模块是否会崩溃
    let pgLoaded = false;
    let pgError = null;
    try {
      require('pg');
      pgLoaded = true;
    } catch (e: any) {
      pgError = e.message;
    }

    res.status(200).json({
      cryptoWorks: true,
      hash: hash.substring(0, 16),
      pgLoaded,
      pgError,
      nodeVersion: process.version,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack?.substring(0, 500) });
  }
}
