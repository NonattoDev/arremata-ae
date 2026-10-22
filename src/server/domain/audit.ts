import { createHmac } from "node:crypto";
import type { Queryable, Row } from "../database";
import { DomainError } from "./types";
const iso = (value: string | Date) => new Date(value).toISOString();
export class AuditService {
  constructor(private secret: string) {
    if (secret.length < 32)
      throw new Error("AUDIT_SECRET precisa ter pelo menos 32 caracteres.");
  }
  sign(data: unknown) {
    return createHmac("sha256", this.secret)
      .update(JSON.stringify(data))
      .digest("hex");
  }
  checkpoint(l: Row) {
    return this.sign([
      "checkpoint-v1",
      l.id,
      l.seller_id,
      l.item,
      Number(l.initial),
      Number(l.increment),
      iso(l.starts_at),
      iso(l.ends_at),
      l.status,
      Number(l.current_amount),
      l.leader_id,
      l.bid_count,
      l.head_hash,
      l.receipt,
    ]);
  }
  bidHash(b: Row) {
    return this.sign([
      "bid-v1",
      b.id,
      b.lot_id,
      b.bidder_id,
      b.alias,
      Number(b.amount),
      b.sequence,
      iso(b.placed_at),
      b.previous_hash,
    ]);
  }
  async saveCheckpoint(tx: Queryable, id: string) {
    const [l] = await tx.query("SELECT * FROM lots WHERE id=$1", [id]);
    if (!l) throw new DomainError("Lote não encontrado.", 404);
    await tx.query("UPDATE lots SET checkpoint=$2 WHERE id=$1", [
      id,
      this.checkpoint(l),
    ]);
  }
  async auditData(tx: Queryable, l: Row) {
    const bids = await tx.query(
      "SELECT * FROM bids WHERE lot_id=$1 ORDER BY sequence",
      [l.id],
    );
    let previous = this.sign(["genesis-v1", l.id]);
    let intact =
      l.checkpoint === this.checkpoint(l) && bids.length === l.bid_count;
    for (let i = 0; i < bids.length; i++) {
      const b = bids[i];
      intact =
        intact &&
        b.sequence === i + 1 &&
        b.previous_hash === previous &&
        b.hash === this.bidHash(b);
      previous = b.hash;
    }
    intact = intact && previous === l.head_hash;
    return {
      intact,
      bids: bids.map((b) => ({
        alias: b.alias,
        amount: Number(b.amount),
        sequence: b.sequence,
        placedAt: iso(b.placed_at),
        hash: b.hash,
      })),
      checkpoint: l.checkpoint,
    };
  }
  async requireIntegrity(tx: Queryable, l: Row) {
    if (!(await this.auditData(tx, l)).intact)
      throw new DomainError(
        "Histórico adulterado. Operações deste lote foram bloqueadas.",
        409,
      );
  }
}
