import type { LoteBanco, LanceBanco } from "../banco/linhas";
import { createHmac } from "node:crypto";
import type { Consultavel } from "../banco";
import { ErroDominio } from "./tipos";
const paraIso = (valor: string | Date) => new Date(valor).toISOString();
export class ServicoAuditoria {
  constructor(private segredo: string) {
    if (segredo.length < 32)
      throw new Error("AUDIT_SECRET precisa ter pelo menos 32 caracteres.");
  }
  assinar(dados: unknown) {
    return createHmac("sha256", this.segredo)
      .update(JSON.stringify(dados))
      .digest("hex");
  }
  pontoVerificacao(loteBanco: LoteBanco) {
    return this.assinar([
      "checkpoint-v1",
      loteBanco.id,
      loteBanco.seller_id,
      loteBanco.item,
      Number(loteBanco.initial),
      Number(loteBanco.increment),
      paraIso(loteBanco.starts_at),
      paraIso(loteBanco.ends_at),
      loteBanco.status,
      Number(loteBanco.current_amount),
      loteBanco.leader_id,
      loteBanco.bid_count,
      loteBanco.head_hash,
      loteBanco.receipt,
    ]);
  }
  hashLance(lanceBanco: Omit<LanceBanco, "hash">) {
    return this.assinar([
      "bid-v1",
      lanceBanco.id,
      lanceBanco.lot_id,
      lanceBanco.bidder_id,
      lanceBanco.alias,
      Number(lanceBanco.amount),
      lanceBanco.sequence,
      paraIso(lanceBanco.placed_at),
      lanceBanco.previous_hash,
    ]);
  }
  async salvarPontoVerificacao(transacao: Consultavel, id: string) {
    const [loteBanco] = await transacao.busca<LoteBanco>(
      "SELECT * FROM lots WHERE id=$1",
      [id],
    );
    if (!loteBanco) throw new ErroDominio("Lote não encontrado.", 404);
    await transacao.busca("UPDATE lots SET checkpoint=$2 WHERE id=$1", [
      id,
      this.pontoVerificacao(loteBanco),
    ]);
  }
  async auditarDados(transacao: Consultavel, loteBanco: LoteBanco) {
    const lances = await transacao.busca<LanceBanco>(
      "SELECT * FROM bids WHERE lot_id=$1 ORDER BY sequence",
      [loteBanco.id],
    );
    let anterior = this.assinar(["genesis-v1", loteBanco.id]);
    let integro =
      loteBanco.checkpoint === this.pontoVerificacao(loteBanco) &&
      lances.length === loteBanco.bid_count;
    for (let i = 0; i < lances.length; i++) {
      const lanceBanco = lances[i];
      integro =
        integro &&
        lanceBanco.sequence === i + 1 &&
        lanceBanco.previous_hash === anterior &&
        lanceBanco.hash === this.hashLance(lanceBanco);
      anterior = lanceBanco.hash;
    }
    integro = integro && anterior === loteBanco.head_hash;
    return {
      intact: integro,
      bids: lances.map((lanceBanco) => ({
        alias: lanceBanco.alias,
        amount: Number(lanceBanco.amount),
        sequence: lanceBanco.sequence,
        placedAt: paraIso(lanceBanco.placed_at),
        hash: lanceBanco.hash,
      })),
      checkpoint: loteBanco.checkpoint,
    };
  }
  async exigirIntegridade(transacao: Consultavel, loteBanco: LoteBanco) {
    if (!(await this.auditarDados(transacao, loteBanco)).intact)
      throw new ErroDominio(
        "Histórico adulterado. Operações deste lote foram bloqueadas.",
        409,
      );
  }
}
