// 根据环境变量选择数据库 schema
const isPg = !!process.env.DATABASE_URL;
const schemaModule = require(isPg ? './pg-schema' : './sqlite-schema');

export const users = schemaModule.users;
export const trainingOrder = schemaModule.trainingOrder;
