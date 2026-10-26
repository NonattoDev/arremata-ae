import type { ItemCatalogo } from "@/servidor/leilao";

export type Usuario = {
  id: string;
  name: string;
  email: string;
  alias: string;
  avatar?: string | null;
  cpf?: string | null;
  nascimento?: string | null;
  role: "seller" | "bidder";
};

export type Lote = {
  id: string;
  item: ItemCatalogo;
  initial: number;
  increment: number;
  currentAmount: number;
  bidCount: number;
  startsAt: string;
  endsAt: string;
  status: string;
  isLeader: boolean;
  isOwner: boolean;
  hasWinner: boolean;
};

export type Lance = {
  alias: string;
  amount: number;
  sequence: number;
  placedAt: string;
  hash: string;
};

export type Sala = Lote & {
  bids: Lance[];
  intact: boolean;
  position: number;
  serverTime: string;
};
