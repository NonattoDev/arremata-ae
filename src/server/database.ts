import { createLocalDatabase } from "./database/local";
import { createPostgresDatabase } from "./database/postgres";
import type { Database } from "./database/types";
export { createLocalDatabase, createPostgresDatabase };
export type { Database, Queryable, Row } from "./database/types";

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
