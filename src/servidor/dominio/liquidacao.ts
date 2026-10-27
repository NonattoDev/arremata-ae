import type { LoteBanco } from "../banco/linhas";
import { randomUUID } from "node:crypto";
import type { Consultavel } from "../banco";
import type { ServicoAuditoria } from "./auditoria";

export async function liquidarVencidos(
  transacao: Consultavel,
  integridade: ServicoAuditoria,
  agora: () => number,
) {
  const vencidos = await transacao.busca<LoteBanco>(
    "SELECT * FROM lots WHERE status='open' AND ends_at <= $1 ORDER BY id",
    [new Date(agora())],
  );
  const bloqueados: string[] = [];
  for (const loteBanco of vencidos) {
    if (!(await integridade.auditarDados(transacao, loteBanco)).intact) {
      bloqueados.push(loteBanco.id);
      continue;
    }
    let comprovante = null;
    if (loteBanco.leader_id) {
      const [vencedor] = await transacao.busca<{ alias: string }>(
        "SELECT alias FROM users WHERE id=$1",
        [loteBanco.leader_id],
      );
      const valor = Number(loteBanco.current_amount);
      await transacao.busca("UPDATE users SET balance=balance-$2 WHERE id=$1", [
        loteBanco.leader_id,
        valor,
      ]);
      await transacao.busca("UPDATE users SET balance=balance+$2 WHERE id=$1", [
        loteBanco.seller_id,
        valor,
      ]);
      for (const [id, valorMovimentacao, tipo] of [
        [loteBanco.leader_id, -valor, "purchase"],
        [loteBanco.seller_id, valor, "sale"],
      ]) {
        await transacao.busca(
          "INSERT INTO ledger (id,user_id,lot_id,amount,kind,created_at) VALUES ($1,$2,$3,$4,$5,$6)",
          [
            randomUUID(),
            id,
            loteBanco.id,
            valorMovimentacao,
            tipo,
            new Date(agora()),
          ],
        );
      }
      comprovante = {
        lotId: loteBanco.id,
        winner: vencedor.alias,
        amount: valor,
        settledAt: new Date(agora()).toISOString(),
        bidHash: loteBanco.head_hash,
      };
    }
    await transacao.busca(
      "UPDATE lots SET status='closed', receipt=$2 WHERE id=$1",
      [loteBanco.id, JSON.stringify(comprovante)],
    );
    await integridade.salvarPontoVerificacao(transacao, loteBanco.id);
  }
  return {
    processed: vencidos.length - bloqueados.length,
    blocked: bloqueados,
  };
}
