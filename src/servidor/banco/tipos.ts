export type LinhaBanco = Record<string, unknown>;
export interface Consultavel {
  busca<T extends object = LinhaBanco>(
    sql: string,
    valores?: unknown[],
  ): Promise<T[]>;
}
export interface BancoDados extends Consultavel {
  lerConsistente<T>(
    operacao: (transacao: Consultavel) => Promise<T>,
  ): Promise<T>;
  transacionar<T>(operacao: (transacao: Consultavel) => Promise<T>): Promise<T>;
  fechar(): Promise<void>;
}
