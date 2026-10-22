import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../../generated/prisma/client";
import type { Database, Queryable, Row } from "./types";

function queries(client: PrismaClient | Prisma.TransactionClient): Queryable {
  return {
    async query<T extends Row>(sql: string, values: unknown[] = []) {
      // Only repository-owned SQL is accepted; user values are bound parameters.
      // DML without RETURNING uses executeRaw (queryRaw requires a row result).
      if (/^\s*(SELECT|WITH)\b/i.test(sql) || /\bRETURNING\b/i.test(sql))
        return client.$queryRawUnsafe<T[]>(sql, ...values);
      await client.$executeRawUnsafe(sql, ...values);
      return [] as T[];
    },
  };
}

export function createPostgresDatabase(url: string): Database {
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url, max: 5 }),
  });
  return {
    ...queries(client),
    transaction: (fn) =>
      client.$transaction(
        async (tx) => {
          // Serializes cross-lot reservations across all application instances.
          // executeRaw avoids deserializing PostgreSQL's void return type.
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(215884)`;
          return fn(queries(tx));
        },
        { maxWait: 10_000, timeout: 30_000 },
      ),
    close: () => client.$disconnect(),
  };
}
