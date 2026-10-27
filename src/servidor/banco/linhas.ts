import type { ItemCatalogo } from "../dominio/tipos";

type DinheiroBanco = bigint | number | string;
type DataBanco = Date | string;
export interface UsuarioBanco {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: "seller" | "bidder";
  alias: string;
  balance: DinheiroBanco;
  cpf: string | null;
  nascimento: DataBanco | null;
}
export interface ComprovanteBanco {
  lotId: string;
  winner: string;
  amount: number;
  settledAt: string;
  bidHash: string;
}
export interface LoteBanco {
  id: string;
  seller_id: string;
  item: ItemCatalogo;
  initial: DinheiroBanco;
  increment: DinheiroBanco;
  current_amount: DinheiroBanco;
  starts_at: DataBanco;
  ends_at: DataBanco;
  created_at: DataBanco;
  status: "open" | "closed" | "cancelled";
  leader_id: string | null;
  bid_count: number;
  head_hash: string;
  checkpoint: string;
  receipt: ComprovanteBanco | null;
}
export interface LanceBanco {
  id: string;
  lot_id: string;
  bidder_id: string;
  alias: string;
  amount: DinheiroBanco;
  sequence: number;
  placed_at: DataBanco;
  previous_hash: string;
  hash: string;
}
export interface DepositoBanco {
  id: string;
  user_id: string;
  amount: DinheiroBanco;
  method: "pix" | "card";
  status: "pending" | "confirmed" | "cancelled" | "expired";
  ready_at: DataBanco;
  expires_at: DataBanco;
  confirmed_at: DataBanco | null;
}
