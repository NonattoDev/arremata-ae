import { randomUUID } from "node:crypto";
import type { Database, Queryable, Row } from "./database";

import { DomainError, type Item, type LotInput } from "./domain/types";
export { DomainError, type Item, type LotInput } from "./domain/types";
const iso = (value: string | Date) => new Date(value).toISOString();
function money(value: number) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > 1000000000)
    throw new DomainError(
      "Valor inválido. Informe um valor positivo em centavos.",
    );
}

import { AuditService } from "./domain/audit";

export class AuctionService {
  private integrity: AuditService;
  constructor(
    private db: Database,
    secret: string,
    private now: () => number = Date.now,
  ) {
    this.integrity = new AuditService(secret);
  }
  private async user(tx: Queryable, id: string, role?: string) {
    const [u] = await tx.query("SELECT * FROM users WHERE id=$1", [id]);
    if (!u) throw new DomainError("Entre para continuar.", 401);
    if (role && u.role !== role)
      throw new DomainError(
        role === "bidder"
          ? "Apenas licitantes podem realizar esta ação."
          : "Apenas leiloeiros podem realizar esta ação.",
        403,
      );
    return u;
  }
  private async lot(tx: Queryable, id: string) {
    const [l] = await tx.query("SELECT * FROM lots WHERE id=$1", [id]);
    if (!l) throw new DomainError("Lote não encontrado.", 404);
    return l;
  }
  private async balances(tx: Queryable, id: string) {
    const u = await this.user(tx, id);
    const [row] = await tx.query(
      "SELECT COALESCE(SUM(current_amount),0) AS committed FROM lots WHERE leader_id=$1 AND status='open'",
      [id],
    );
    const total = Number(u.balance),
      committed = Number(row.committed);
    return { total, committed, available: total - committed };
  }
  private async settleInside(tx: Queryable) {
    const due = await tx.query(
      "SELECT * FROM lots WHERE status='open' AND ends_at <= $1 ORDER BY id",
      [new Date(this.now())],
    );
    const blocked: string[] = [];
    for (const l of due) {
      if (!(await this.integrity.auditData(tx, l)).intact) {
        blocked.push(l.id);
        continue;
      }
      let receipt = null;
      if (l.leader_id) {
        const winner = await this.user(tx, l.leader_id);
        const amount = Number(l.current_amount);
        await tx.query("UPDATE users SET balance=balance-$2 WHERE id=$1", [
          l.leader_id,
          amount,
        ]);
        await tx.query("UPDATE users SET balance=balance+$2 WHERE id=$1", [
          l.seller_id,
          amount,
        ]);
        for (const [id, value, kind] of [
          [l.leader_id, -amount, "purchase"],
          [l.seller_id, amount, "sale"],
        ]) {
          await tx.query(
            "INSERT INTO ledger (id,user_id,lot_id,amount,kind,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
            [randomUUID(), id, l.id, value, kind, new Date(this.now())],
          );
        }
        receipt = {
          lotId: l.id,
          winner: winner.alias,
          amount,
          settledAt: new Date(this.now()).toISOString(),
          bidHash: l.head_hash,
        };
      }
      await tx.query(
        "UPDATE lots SET status='closed', receipt=$2 WHERE id=$1",
        [l.id, JSON.stringify(receipt)],
      );
      await this.integrity.saveCheckpoint(tx, l.id);
    }
    return { processed: due.length - blocked.length, blocked };
  }
  async createUser(
    email: string,
    name: string,
    hash: string,
    role: "seller" | "bidder",
  ) {
    const id = randomUUID();
    await this.db.query(
      "INSERT INTO users (id,email,name,password_hash,role,alias) VALUES ($1,$2,$3,$4,$5,$6)",
      [
        id,
        email.toLowerCase().trim(),
        name,
        hash,
        role,
        `Participante ${randomUUID().slice(0, 8)}`,
      ],
    );
    return id;
  }
  async deposit(id: string, amount: number) {
    money(amount);
    return this.db.transaction(async (tx) => {
      await this.user(tx, id, "bidder");
      await this.settleInside(tx);
      const balance = await this.balances(tx, id);
      if (balance.total + amount > 1000000000000)
        throw new DomainError("Limite de saldo simulado atingido.");
      await tx.query("UPDATE users SET balance=balance+$2 WHERE id=$1", [
        id,
        amount,
      ]);
      await tx.query(
        "INSERT INTO ledger (id,user_id,amount,kind,created_at) VALUES ($1,$2,$3,$4,$5)",
        [randomUUID(), id, amount, "deposit", new Date(this.now())],
      );
      return this.balances(tx, id);
    });
  }
  async wallet(id: string) {
    return this.db.transaction(async (tx) => {
      await this.settleInside(tx);
      return this.balances(tx, id);
    });
  }
  async createLot(seller: string, input: LotInput) {
    money(input.initial);
    money(input.increment);
    const start = Date.parse(input.startsAt),
      end = Date.parse(input.endsAt);
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start ||
      end <= this.now()
    )
      throw new DomainError(
        "Datas inválidas: o fim deve ser futuro e posterior ao início.",
      );
    return this.db.transaction(async (tx) => {
      await this.user(tx, seller, "seller");
      const id = randomUUID(),
        head = this.integrity.sign(["genesis-v1", id]);
      await tx.query(
        "INSERT INTO lots (id,seller_id,item,initial,increment,starts_at,ends_at,head_hash,checkpoint) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          id,
          seller,
          JSON.stringify(input.item),
          input.initial,
          input.increment,
          new Date(start),
          new Date(end),
          head,
          "pending",
        ],
      );
      await this.integrity.saveCheckpoint(tx, id);
      return id;
    });
  }
  async bid(userId: string, lotId: string, amount: number) {
    money(amount);
    return this.db.transaction(async (tx) => {
      const u = await this.user(tx, userId, "bidder");
      await this.settleInside(tx);
      const l = await this.lot(tx, lotId);
      const now = this.now();
      await this.integrity.requireIntegrity(tx, l);
      if (l.status !== "open" || now >= new Date(l.ends_at).getTime())
        throw new DomainError("Lote encerrado ou cancelado.");
      if (now < new Date(l.starts_at).getTime())
        throw new DomainError("Lote ainda não iniciado.");
      if (l.leader_id === userId)
        throw new DomainError("Você já está ganhando este lote.");
      const min = l.bid_count
        ? Number(l.current_amount) + Number(l.increment)
        : Number(l.initial);
      if (amount < min)
        throw new DomainError(
          `Lance abaixo do mínimo: R$ ${(min / 100).toFixed(2)}.`,
        );
      if ((await this.balances(tx, userId)).available < amount)
        throw new DomainError("Saldo disponível insuficiente.");
      const b = {
        id: randomUUID(),
        lot_id: lotId,
        bidder_id: userId,
        alias: u.alias,
        amount,
        sequence: l.bid_count + 1,
        placed_at: new Date(now),
        previous_hash: l.head_hash,
      };
      const hash = this.integrity.bidHash(b);
      const end =
        new Date(l.ends_at).getTime() - now <= 120000
          ? new Date(now + 120000)
          : l.ends_at;
      await tx.query(
        "INSERT INTO bids (id,lot_id,bidder_id,alias,amount,sequence,placed_at,previous_hash,hash) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          b.id,
          lotId,
          userId,
          u.alias,
          amount,
          b.sequence,
          b.placed_at,
          b.previous_hash,
          hash,
        ],
      );
      await tx.query(
        "UPDATE lots SET current_amount=$2,leader_id=$3,bid_count=$4,head_hash=$5,ends_at=$6 WHERE id=$1",
        [lotId, amount, userId, b.sequence, hash, end],
      );
      await this.integrity.saveCheckpoint(tx, lotId);
      return { accepted: true, endsAt: iso(end) };
    });
  }
  async cancel(userId: string, lotId: string) {
    return this.db.transaction(async (tx) => {
      await this.user(tx, userId, "seller");
      await this.settleInside(tx);
      const l = await this.lot(tx, lotId);
      await this.integrity.requireIntegrity(tx, l);
      if (l.seller_id !== userId)
        throw new DomainError("Sem permissão para este lote.", 403);
      if (l.bid_count)
        throw new DomainError("Lotes com lances não podem ser cancelados.");
      if (l.status !== "open")
        throw new DomainError("Este lote já foi encerrado ou cancelado.");
      await tx.query("UPDATE lots SET status='cancelled' WHERE id=$1", [lotId]);
      await this.integrity.saveCheckpoint(tx, lotId);
    });
  }
  async settle() {
    return this.db.transaction((tx) => this.settleInside(tx));
  }
  private publicLot(l: Row, userId?: string) {
    const phase =
      l.status !== "open"
        ? l.status
        : this.now() < new Date(l.starts_at).getTime()
          ? "scheduled"
          : this.now() >= new Date(l.ends_at).getTime()
            ? "closed"
            : "live";
    return {
      id: l.id,
      item: { ...l.item, image: `/api/lots/${l.id}/image` } as Item,
      initial: Number(l.initial),
      increment: Number(l.increment),
      currentAmount: Number(l.current_amount),
      bidCount: l.bid_count as number,
      startsAt: iso(l.starts_at),
      endsAt: iso(l.ends_at),
      status: phase as string,
      isLeader: !!userId && l.leader_id === userId,
      isOwner: !!userId && l.seller_id === userId,
      hasWinner: !!l.receipt,
    };
  }
  async listLots(userId?: string, mode = "all") {
    return this.db.transaction(async (tx) => {
      await this.settleInside(tx);
      const lots =
        mode === "seller"
          ? await tx.query(
              "SELECT * FROM lots WHERE seller_id=$1 ORDER BY created_at DESC",
              [userId],
            )
          : mode === "mine"
            ? await tx.query(
                "SELECT * FROM lots WHERE id IN (SELECT lot_id FROM bids WHERE bidder_id=$1) ORDER BY created_at DESC",
                [userId],
              )
            : await tx.query(
                "SELECT * FROM lots WHERE status != 'cancelled' ORDER BY created_at DESC",
              );
      return lots.map((l) => this.publicLot(l, userId));
    });
  }
  async getLot(id: string, userId?: string) {
    return this.db.transaction(async (tx) => {
      await this.settleInside(tx);
      const l = await this.lot(tx, id);
      const audit = await this.integrity.auditData(tx, l);
      const ranks = await tx.query(
        "SELECT bidder_id, MAX(amount) AS amount FROM bids WHERE lot_id=$1 GROUP BY bidder_id ORDER BY MAX(amount) DESC",
        [id],
      );
      return {
        ...this.publicLot(l, userId),
        ...audit,
        position: userId
          ? ranks.findIndex((r) => r.bidder_id === userId) + 1
          : 0,
        serverTime: new Date(this.now()).toISOString(),
      };
    });
  }
  async audit(id: string) {
    return this.db.transaction(async (tx) => {
      const l = await this.lot(tx, id);
      return {
        lotId: id,
        title: l.item.title,
        ...(await this.integrity.auditData(tx, l)),
      };
    });
  }
  async receipt(id: string) {
    return this.db.transaction(async (tx) => {
      await this.settleInside(tx);
      const l = await this.lot(tx, id);
      await this.integrity.requireIntegrity(tx, l);
      if (!l.receipt)
        throw new DomainError(
          "Este lote não possui comprovante de arremate.",
          404,
        );
      return {
        ...l.receipt,
        item: { ...l.item, image: `/api/lots/${l.id}/image` } as Item,
        checkpoint: l.checkpoint,
      };
    });
  }
}
