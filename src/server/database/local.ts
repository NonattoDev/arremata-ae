import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Database, Queryable, Row } from "./types";
export async function createLocalDatabase(path?: string): Promise<Database> {
  if (path) await mkdir(dirname(path), { recursive: true });
  const { PGlite } = await import("@electric-sql/pglite");
  const engine = new PGlite(path);
  let queue: Promise<unknown> = Promise.resolve();
  const exclusive = <T>(fn: () => Promise<T>): Promise<T> => {
    const result = queue.then(fn);
    queue = result.catch(() => {});
    return result;
  };
  const wrap = (client: Pick<typeof engine, "query" | "exec">): Queryable => ({
    async query<T extends Row>(sql: string, values?: unknown[]) {
      if (!values && sql.includes(";")) {
        await client.exec(sql);
        return [] as T[];
      }
      return (await client.query<T>(sql, values)).rows;
    },
  });
  return {
    query: (sql, values) => exclusive(() => wrap(engine).query(sql, values)),
    transaction: (fn) =>
      exclusive(() => engine.transaction((tx) => fn(wrap(tx)))),
    close: () => engine.close(),
  };
}
