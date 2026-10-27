import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { BancoDados, Consultavel } from "./tipos";
export async function criarBancoLocal(caminho?: string): Promise<BancoDados> {
  if (caminho) await mkdir(dirname(caminho), { recursive: true });
  const { PGlite } = await import("@electric-sql/pglite");
  const motor = new PGlite(caminho);
  let fila: Promise<unknown> = Promise.resolve();
  const executarExclusivo = <T>(operacao: () => Promise<T>): Promise<T> => {
    const resultado = fila.then(operacao);
    fila = resultado.catch(() => {});
    return resultado;
  };
  const adaptarConsultas = (
    cliente: Pick<typeof motor, "query" | "exec">,
  ): Consultavel => ({
    async busca<T extends object>(sql: string, valores?: unknown[]) {
      if (!valores && sql.includes(";")) {
        await cliente.exec(sql);
        return [] as T[];
      }
      return (await cliente.query<T>(sql, valores)).rows;
    },
  });
  return {
    lerConsistente: (operacao) =>
      executarExclusivo(() =>
        motor.transaction((transacao) => operacao(adaptarConsultas(transacao))),
      ),
    busca: (sql, valores) =>
      executarExclusivo(() => adaptarConsultas(motor).busca(sql, valores)),
    transacionar: (operacao) =>
      executarExclusivo(() =>
        motor.transaction((transacao) => operacao(adaptarConsultas(transacao))),
      ),
    fechar: () => motor.close(),
  };
}
