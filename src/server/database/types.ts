export type Row = Record<string, any>;
export interface Queryable {
  query<T extends Row = Row>(sql: string, values?: unknown[]): Promise<T[]>;
}
export interface Database extends Queryable {
  transaction<T>(fn: (tx: Queryable) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
