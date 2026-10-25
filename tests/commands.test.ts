import { test } from "node:test";
import assert from "node:assert/strict";
import { criarBancoLocal } from "../src/servidor/banco";
import { ServicoLeiloes, ErroDominio } from "../src/servidor/leilao";
import { esquema } from "../src/servidor/esquema";
import { depositar, criarLote } from "../src/servidor/comandos/mercado";
import type { ContextoComando } from "../src/servidor/comandos/contexto";
import { ZodError } from "zod";

test("comandos das Actions recusam ausência de sessão, papel incorreto e valores inválidos", async () => {
  const banco = await criarBancoLocal();
  try {
    await banco.busca(esquema);
    const servico = new ServicoLeiloes(
      banco,
      "commands-test-secret-with-at-least-32-characters",
    );
    const contexto: ContextoComando = {
      db: banco,
      service: servico,
      token: undefined,
      user: undefined,
    };
    const status = (esperado: number) => (erro: unknown) =>
      erro instanceof ErroDominio && erro.status === esperado;
    await assert.rejects(depositar(contexto, { amount: 100 }), status(401));
    const sellerId = await servico.criarUsuario(
      "seller@commands.test",
      "Seller",
      "test",
      "seller",
    );
    contexto.user = {
      id: sellerId,
      name: "Seller",
      email: "seller@commands.test",
      alias: "Seller",
      role: "seller",
    };
    await assert.rejects(depositar(contexto, { amount: 100 }), status(403));
    const bidderId = await servico.criarUsuario(
      "bidder@commands.test",
      "Bidder",
      "test",
      "bidder",
    );
    contexto.user = { ...contexto.user, id: bidderId, role: "bidder" };
    await assert.rejects(criarLote(contexto, {}), status(403));
    await assert.rejects(depositar(contexto, { amount: -1 }), ZodError);
    // A identidade enviada pelo cliente é ignorada; o crédito pertence à sessão verificada.
    await depositar(contexto, { amount: 100, userId: sellerId });
    assert.equal((await servico.carteira(bidderId)).total, 100);
    assert.equal((await servico.carteira(sellerId)).total, 0);
  } finally {
    await banco.fechar();
  }
});
