import { randomUUID } from "node:crypto";
import { z } from "zod";
import { exigirUsuario, type ContextoComando } from "./contexto";
import { ErroDominio } from "../leilao";
import type { LinhaBanco } from "../banco";
import type { DepositoSimulado } from "@/tipos/deposito";

function apresentar(linha: LinhaBanco, agora: number): DepositoSimulado {
  return {
    id: linha.id,
    valor: Number(linha.amount),
    metodo: linha.method,
    estado: linha.status,
    disponivelEm: new Date(linha.ready_at).toISOString(),
    expiraEm: new Date(linha.expires_at).toISOString(),
    agora: new Date(agora).toISOString(),
  };
}
export async function iniciarDeposito(
  contexto: ContextoComando,
  entrada: unknown,
  agora = Date.now(),
) {
  const usuario = await exigirUsuario(contexto);
  if (usuario.role !== "bidder")
    throw new ErroDominio("Apenas licitantes podem adicionar saldo.", 403);
  const dados = z
    .object({
      valor: z.number().int().positive().max(1000000000),
      metodo: z.enum(["pix", "card"]),
    })
    .strict()
    .parse(entrada);
  return contexto.db.transacionar(async (banco) => {
    await banco.busca(
      "UPDATE deposit_simulations SET status='expired' WHERE user_id=$1 AND status='pending' AND expires_at <= $2",
      [usuario.id, new Date(agora)],
    );
    const [pendente] = await banco.busca(
      "SELECT * FROM deposit_simulations WHERE user_id=$1 AND status='pending'",
      [usuario.id],
    );
    if (pendente) {
      if (
        Number(pendente.amount) !== dados.valor ||
        pendente.method !== dados.metodo
      )
        throw new ErroDominio("Conclua ou cancele o depósito em andamento.");
      return apresentar(pendente, agora);
    }
    const [criado] = await banco.busca(
      "INSERT INTO deposit_simulations (id,user_id,amount,method,created_at,ready_at,expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [
        randomUUID(),
        usuario.id,
        dados.valor,
        dados.metodo,
        new Date(agora),
        new Date(agora + (dados.metodo === "pix" ? 5000 : 3000)),
        new Date(agora + 600000),
      ],
    );
    return apresentar(criado, agora);
  });
}

// O QR contém somente um identificador aleatório temporário. Nunca permite escolher conta ou valor.
export async function processarDeposito(
  contexto: ContextoComando,
  identificador: unknown,
  modo: "acompanhar" | "qr" | "cancelar",
  agora = Date.now(),
) {
  const id = z.uuid().parse(identificador);
  const usuario = modo === "qr" ? undefined : await exigirUsuario(contexto);
  return contexto.db.transacionar(async (banco) => {
    const [deposito] = await banco.busca(
      "SELECT * FROM deposit_simulations WHERE id=$1 FOR UPDATE",
      [id],
    );
    if (
      !deposito ||
      (modo !== "qr" && deposito.user_id !== usuario?.id) ||
      (modo === "qr" && deposito.method !== "pix")
    )
      throw new ErroDominio("Depósito não encontrado.", 404);
    if (deposito.status !== "pending") return apresentar(deposito, agora);
    if (
      new Date(deposito.expires_at).getTime() <= agora ||
      modo === "cancelar"
    ) {
      const estado =
        new Date(deposito.expires_at).getTime() <= agora
          ? "expired"
          : "cancelled";
      await banco.busca(
        "UPDATE deposit_simulations SET status=$2 WHERE id=$1",
        [id, estado],
      );
      return apresentar({ ...deposito, status: estado }, agora);
    }
    if (modo !== "qr" && new Date(deposito.ready_at).getTime() > agora)
      return apresentar(deposito, agora);
    // O adapter compartilha o lock das transações de leilão. QR e polling creditam juntos uma única vez.
    const creditados = await banco.busca(
      "UPDATE users SET balance=balance+$2 WHERE id=$1 AND role='bidder' AND balance+$2 <= 1000000000000 RETURNING id",
      [deposito.user_id, deposito.amount],
    );
    if (!creditados.length)
      throw new ErroDominio("Limite de saldo simulado atingido.");
    await banco.busca(
      "INSERT INTO ledger (id,user_id,amount,kind,created_at) VALUES ($1,$2,$3,'deposit',$4)",
      [id, deposito.user_id, deposito.amount, new Date(agora)],
    );
    await banco.busca(
      "UPDATE deposit_simulations SET status='confirmed',confirmed_at=$2 WHERE id=$1",
      [id, new Date(agora)],
    );
    return apresentar({ ...deposito, status: "confirmed" }, agora);
  });
}
