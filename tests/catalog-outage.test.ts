import { test } from "node:test";
import assert from "node:assert/strict";
import { criarBancoLocal } from "../src/servidor/banco";
import { ServicoLeiloes } from "../src/servidor/leilao";
import { buscarObras, importarObra } from "../src/servidor/catalogo";
import { esquema } from "../src/servidor/esquema";

test("lotes persistidos, salas, auditoria e comprovantes resistem à queda da API pública", async (t) => {
  const banco = await criarBancoLocal();
  try {
    await banco.busca(esquema);
    let relogio = Date.parse("2026-10-22T12:00:00Z");
    const servico = new ServicoLeiloes(
      banco,
      "outage-secret-with-at-least-32-characters",
      () => relogio,
    );
    const leiloeiro = await servico.criarUsuario(
      "seller@outage.test",
      "Seller",
      "hash",
      "seller",
    );
    const licitante = await servico.criarUsuario(
      "bidder@outage.test",
      "Bidder",
      "hash",
      "bidder",
    );
    const item = {
      externalId: "136510",
      title: "Obra persistida",
      artist: "Artista",
      date: "1888",
      image: "data:image/jpeg;base64,/9j/2Q==",
      sourceUrl: "https://www.clevelandart.org/art/1929.11",
    };
    const id = await servico.criarLote(leiloeiro, {
      item,
      initial: 10000,
      increment: 1000,
      startsAt: new Date(relogio - 1000).toISOString(),
      endsAt: new Date(relogio + 180000).toISOString(),
    });
    await banco.busca(
      "UPDATE users SET cpf='52998224725', nascimento='1990-01-01' WHERE id=$1",
      [licitante],
    );
    await servico.depositar(licitante, 20000);
    const simulacaoFetch = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("Indisponibilidade simulada do museu");
    });
    await assert.rejects(buscarObras("Monet"), /indisponível/i);
    await assert.rejects(importarObra("136510"), /indisponível/i);
    const chamadasExternas = simulacaoFetch.mock.callCount();
    assert.equal((await servico.listarLotes()).length, 1);
    assert.equal((await servico.obterLote(id)).item.title, item.title);
    await servico.darLance(licitante, id, 10000);
    assert.equal((await servico.auditar(id)).intact, true);
    relogio += 180000;
    await servico.liquidar();
    assert.equal((await servico.comprovante(id)).amount, 10000);
    const [armazenado] = await banco.busca<{ item: { image: string } }>(
      "SELECT item FROM lots WHERE id=$1",
      [id],
    );
    assert.equal(armazenado.item.image, item.image);
    assert.equal(
      simulacaoFetch.mock.callCount(),
      chamadasExternas,
      "lotes existentes não devem consultar a API externa",
    );
  } finally {
    await banco.fechar();
  }
});
