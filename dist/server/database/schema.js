"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingOrder = exports.users = void 0;
// 根据环境变量选择数据库 schema
let schemaModule;
if (process.env.DATABASE_URL) {
    schemaModule = require('./pg-schema');
}
else {
    schemaModule = require('./sqlite-schema');
}
exports.users = schemaModule.users;
exports.trainingOrder = schemaModule.trainingOrder;
