// 根据环境变量选择数据库 schema
let schemaModule: any;
if (process.env.DATABASE_URL) {
  schemaModule = require('./pg-schema');
} else {
  schemaModule = require('./sqlite-schema');
}

export const users = schemaModule.users;
export const trainingOrder = schemaModule.trainingOrder;
