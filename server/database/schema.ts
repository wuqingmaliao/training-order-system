// 根据环境变量选择数据库 schema
// 使用 if/else 动态 require，避免 Vercel 打包时加载 SQLite 相关模块
const isPg = !!process.env.DATABASE_URL;
let users: any;
let trainingOrder: any;

if (isPg) {
  const pgSchema = require('./pg-schema');
  users = pgSchema.users;
  trainingOrder = pgSchema.trainingOrder;
} else {
  const sqliteSchema = require('./sqlite-schema');
  users = sqliteSchema.users;
  trainingOrder = sqliteSchema.trainingOrder;
}

export { users, trainingOrder };
