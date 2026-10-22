import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Local/test bootstrap uses the same SQL checked into Prisma Migrate.
export const schema = readFileSync(
  resolve("prisma/migrations/20261022000000_initial/migration.sql"),
  "utf8",
);
