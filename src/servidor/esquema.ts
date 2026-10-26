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
  ) +
  readFileSync(
    resolve(
      "prisma/migrations/20261025020000_depositos_simulados/migration.sql",
    ),
    "utf8",
  ) +
  readFileSync(
    resolve(
      "prisma/migrations/20261025030000_preferencias_novidades/migration.sql",
    ),
    "utf8",
  ) +
  readFileSync(
    resolve(
      "prisma/migrations/20261025040000_contatos_novidades/migration.sql",
    ),
    "utf8",
  ) +
  readFileSync(
    resolve(
      "prisma/migrations/20261026000000_nascimento_usuario/migration.sql",
    ),
    "utf8",
  );
