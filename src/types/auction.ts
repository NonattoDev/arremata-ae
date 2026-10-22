import type { Item } from "@/server/auction";

export type User = {
  id: string;
  name: string;
  email: string;
  alias: string;
  role: "seller" | "bidder";
};

export type Lot = {
  id: string;
  item: Item;
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

export type Bid = {
  alias: string;
  amount: number;
  sequence: number;
  placedAt: string;
  hash: string;
};

export type Room = Lot & {
  bids: Bid[];
  intact: boolean;
  position: number;
  serverTime: string;
};
