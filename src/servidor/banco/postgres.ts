import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../../generated/prisma/client";
import type { BancoDados, Consultavel, LinhaBanco } from "./tipos";

function consultas(
  cliente: PrismaClient | Prisma.TransactionClient,
): Consultavel {
  return {
    async busca<T extends LinhaBanco>(sql: string, valores: unknown[] = []) {
      // As consultas são definidas no projeto; dados do usuário entram somente como parâmetros.
      // Escritas sem RETURNING usam executeRaw; queryRaw exige linhas de retorno.
      if (/^\s*(SELECT|WITH)\b/i.test(sql) || /\bRETURNING\b/i.test(sql))
        return cliente.$queryRawUnsafe<T[]>(sql, ...valores);
      await cliente.$executeRawUnsafe(sql, ...valores);
      return [] as T[];
    },
  };
}

export function criarBancoPostgres(endereco: string): BancoDados {
  const cliente = new PrismaClient({
    adapter: new PrismaPg({ connectionString: endereco, max: 5 }),
  });
  return {
    ...consultas(cliente),
    transacionar: (operacao) =>
      cliente.$transaction(
        async (transacao) => {
          // O bloqueio protege o mesmo saldo quando há lances em lotes e instâncias diferentes.
          // executeRaw evita tentar desserializar o retorno void do PostgreSQL.
          await transacao.$executeRaw`SELECT pg_advisory_xact_lock(215884)`;
          return operacao(consultas(transacao));
        },
        { maxWait: 10_000, timeout: 30_000 },
      ),
    fechar: () => cliente.$disconnect(),
  };
}
