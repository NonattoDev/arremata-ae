export type LinhaBanco = Record<string, any>;
export interface Consultavel {
  busca<T extends LinhaBanco = LinhaBanco>(
    sql: string,
    valores?: unknown[],
  ): Promise<T[]>;
}
export interface BancoDados extends Consultavel {
  transacionar<T>(operacao: (transacao: Consultavel) => Promise<T>): Promise<T>;
  fechar(): Promise<void>;
}
