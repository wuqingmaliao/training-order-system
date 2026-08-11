// 统一 SQLite（同步）和 PostgreSQL（异步）的查询执行
// 用法：const rows = await $await(this.db.select().from(table).where(cond));
//
// SQLite drizzle: select 查询需要 .all()，insert/update/delete 需要 .run()
// PostgreSQL drizzle: 所有查询本身就是 Promise（thenable）
export function $await<T = any>(query: any): Promise<T> {
  if (query == null) return Promise.resolve(query);
  // postgres.js: 查询是 thenable（Promise）
  if (typeof query.then === 'function') {
    return query;
  }
  // better-sqlite3: select 查询构建器有 .all()
  if (typeof query.all === 'function') {
    return Promise.resolve(query.all());
  }
  // better-sqlite3: insert/update/delete 构建器有 .run()
  if (typeof query.run === 'function') {
    return Promise.resolve(query.run());
  }
  return Promise.resolve(query);
}
