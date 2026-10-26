import { test } from "node:test";
import assert from "node:assert/strict";
import { criarBancoLocal } from "../src/servidor/banco";
import { esquema } from "../src/servidor/esquema";
import { ServicoLeiloes } from "../src/servidor/leilao";

test("cancelamento estorna só a reserva, preserva auditoria e resiste a repetição e lance concorrente", async () => {
  const banco = await criarBancoLocal();
  let agora = Date.parse("2026-10-26T12:00:00Z");
  const servico = new ServicoLeiloes(
    banco,
    "segredo-de-teste-com-mais-de-32-caracteres",
    () => agora,
  );
  try {
    await banco.busca(esquema);
    const vendedor = await servico.criarUsuario(
      "v@test.local",
      "Vendedor",
      "hash",
      "seller",
    );
    const ana = await servico.criarUsuario(
      "a@test.local",
      "Ana",
      "hash",
      "bidder",
    );
    const bruno = await servico.criarUsuario(
      "b@test.local",
      "Bruno",
      "hash",
      "bidder",
    );
    await banco.busca(
      "UPDATE users SET cpf='52998224725', nascimento='1990-01-01' WHERE role='bidder'",
    );
    await servico.depositar(ana, 50000);
    await servico.depositar(bruno, 50000);
    const criar = () =>
      servico.criarLote(vendedor, {
        item: {
          externalId: "1",
          title: "Obra",
          artist: "Artista",
          date: "1888",
          image: "data:image/png;base64,AA==",
          sourceUrl: "https://example.com",
        },
        initial: 10000,
        increment: 1000,
        startsAt: new Date(agora - 1000).toISOString(),
        endsAt: new Date(agora + 600000).toISOString(),
      });
    const id = await criar();
    const outro = await criar();
    await servico.darLance(ana, outro, 10000);
    await servico.darLance(ana, id, 10000);
    await servico.darLance(bruno, id, 11000);
    const auditoria = await servico.auditar(id);
    await servico.cancelar(vendedor, id);
    assert.deepEqual(await servico.carteira(bruno), {
      total: 50000,
      committed: 0,
      available: 50000,
    });
    assert.deepEqual(await servico.carteira(ana), {
      total: 50000,
      committed: 10000,
      available: 40000,
    });
    assert.equal((await servico.carteira(vendedor)).total, 0);
    assert.equal((await servico.auditar(id)).intact, true);
    assert.deepEqual((await servico.auditar(id)).bids, auditoria.bids);
    assert.equal((await servico.obterLote(id, bruno)).isLeader, false);
    await servico.cancelar(vendedor, id);
    assert.equal((await servico.carteira(bruno)).total, 50000);
    await assert.rejects(servico.darLance(bruno, id, 12000), /cancelado/);
    await assert.rejects(servico.comprovante(id), /não possui/);
    assert.equal(
      (await servico.listarLotes()).some((l) => l.id === id),
      false,
    );
    const disputa = await criar();
    await Promise.allSettled([
      servico.darLance(bruno, disputa, 10000),
      servico.cancelar(vendedor, disputa),
    ]);
    assert.equal((await servico.obterLote(disputa)).status, "cancelled");
    assert.equal((await servico.carteira(bruno)).committed, 0);
    assert.equal((await servico.auditar(disputa)).intact, true);
    agora += 700000;
    await servico.liquidar();
    await assert.rejects(servico.cancelar(vendedor, outro), /encerrado/);
    assert.equal((await servico.carteira(vendedor)).total, 10000);
    const [movimentos] = await banco.busca(
      "SELECT COUNT(*) AS total FROM ledger WHERE lot_id=$1",
      [id],
    );
    assert.equal(Number(movimentos.total), 0);
  } finally {
    await banco.fechar();
  }
});
