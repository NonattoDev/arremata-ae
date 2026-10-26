export type DepositoSimulado = {
  id: string;
  valor: number;
  metodo: "pix" | "card";
  estado: "pending" | "confirmed" | "cancelled" | "expired";
  disponivelEm: string;
  expiraEm: string;
  agora: string;
};
