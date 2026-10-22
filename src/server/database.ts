import { Pool } from "pg";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
export type Row = Record<string, any>;
export interface Queryable {
  query<T extends Row = Row>(sql: string, values?: unknown[]): Promise<T[]>;
}
export interface Database extends Queryable {
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

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

export function createPostgresDatabase(url: string): Database {
  const pool = new Pool({ connectionString: url, max: 5 });
  return {
    async query<T extends Row>(sql: string, values?: unknown[]) {
      return (await pool.query<T>(sql, values)).rows;
    },
    async transaction(fn) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        // A database-wide market lock is deliberately simple for this challenge.
        // It protects cross-lot wallet reservations across all serverless instances.
        await client.query("SELECT pg_advisory_xact_lock(215884)");
        const result = await fn({
          async query<T extends Row>(sql: string, values?: unknown[]) {
            return (await client.query<T>(sql, values)).rows;
          },
        });
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}

const globalDb = globalThis as unknown as {
  auctionDatabase?: Promise<Database>;
};
export function database(): Promise<Database> {
  if (!globalDb.auctionDatabase) {
    if (process.env.DATABASE_URL)
      globalDb.auctionDatabase = Promise.resolve(
        createPostgresDatabase(process.env.DATABASE_URL),
      );
    else if (process.env.VERCEL || process.env.NODE_ENV === "production")
      throw new Error("DATABASE_URL é obrigatória em produção.");
    else
      globalDb.auctionDatabase = createLocalDatabase(
        process.env.LOCAL_DATABASE_PATH || ".local/postgres",
      );
  }
  return globalDb.auctionDatabase;
}
