import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// O banco local usa o mesmo SQL versionado nas migrations do Prisma.
export const esquema =
  readFileSync(
    resolve("prisma/migrations/20261022000000_initial/migration.sql"),
    "utf8",
  ) +
  readFileSync(
    resolve("prisma/migrations/20261025000000_avatar_usuario/migration.sql"),
    "utf8",
  ) +
  readFileSync(
    resolve("prisma/migrations/20261025010000_cpf_usuario/migration.sql"),
    "utf8",
  );
