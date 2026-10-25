import { criarBancoLocal } from "./banco/local";
import { criarBancoPostgres } from "./banco/postgres";
import type { BancoDados } from "./banco/tipos";
export { criarBancoLocal, criarBancoPostgres };
export type { BancoDados, Consultavel, LinhaBanco } from "./banco/tipos";

const bancoGlobal = globalThis as unknown as {
  bancoLeiloes?: Promise<BancoDados>;
};
export function bancoDados(): Promise<BancoDados> {
  if (!bancoGlobal.bancoLeiloes) {
    if (process.env.DATABASE_URL)
      bancoGlobal.bancoLeiloes = Promise.resolve(
        criarBancoPostgres(process.env.DATABASE_URL),
      );
    else if (process.env.VERCEL || process.env.NODE_ENV === "production")
      throw new Error("DATABASE_URL é obrigatória em produção.");
    else
      bancoGlobal.bancoLeiloes = criarBancoLocal(
        process.env.LOCAL_DATABASE_PATH || ".local/postgres",
      );
  }
  return bancoGlobal.bancoLeiloes;
}
