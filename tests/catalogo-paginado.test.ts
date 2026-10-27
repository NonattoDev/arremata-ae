import { test } from "node:test";
import assert from "node:assert/strict";
import { criarBancoLocal } from "../src/servidor/banco";
import { esquema } from "../src/servidor/esquema";
import { ServicoLeiloes } from "../src/servidor/leilao";

test("catálogo pagina, filtra no banco e não trava a fila financeira em leituras", async () => {
  const banco = await criarBancoLocal();
  const agora = Date.parse("2026-10-27T12:00:00Z");
  const servico = new ServicoLeiloes(
    banco,
    "segredo-de-teste-com-mais-de-32-caracteres",
    () => agora,
  );
  try {
    await banco.busca(esquema);
    const vendedor = await servico.criarUsuario(
      "galeria@test.local",
      "Galeria",
      "hash",
      "seller",
    );
    for (let indice = 0; indice < 15; indice++) {
      await servico.criarLote(vendedor, {
        item: {
          externalId: String(indice),
          title: `Óleo ${indice}`,
          artist: indice % 2 ? "Monet" : "Degas",
          date: "1888",
          image: "data:image/png;base64,AA==",
          sourceUrl: "https://example.com",
        },
        initial: (indice + 1) * 10000,
        increment: 1000,
        startsAt: new Date(
          agora + (indice === 14 ? 60000 : -1000),
        ).toISOString(),
        endsAt: new Date(agora + 600000).toISOString(),
      });
    }
    banco.transacionar = async () => {
      throw new Error("Leitura não deve entrar na fila financeira");
    };
    const primeira = await servico.catalogo({ ordem: "menor" });
    const segunda = await servico.catalogo({ ordem: "menor", pagina: 2 });
    assert.equal(primeira.lotes.length, 12);
    assert.equal(segunda.lotes.length, 2);
    assert.equal(
      new Set([...primeira.lotes, ...segunda.lotes].map((lote) => lote.id))
        .size,
      14,
    );
    assert.deepEqual(primeira.totais, { live: 14, scheduled: 1, closed: 0 });
    assert.equal(primeira.temMais, true);
    assert.equal(segunda.temMais, false);
    assert.ok(
      primeira.lotes.every((lote) => lote.item.image.startsWith("/api/lots/")),
    );
    const filtrado = await servico.catalogo({
      busca: "oleo",
      artista: "Monet",
      data: "1888",
      minimo: 200,
      maximo: 400,
      ordem: "maior",
    });
    assert.equal(filtrado.total, 2);
    assert.equal(filtrado.lotes[0].item.title, "Óleo 3");
    assert.equal((await servico.catalogo({ busca: "' OR true --" })).total, 0);
    assert.equal(
      (await servico.catalogo({ status: "scheduled" })).lotes.length,
      1,
    );
    await assert.rejects(servico.catalogo({ pagina: 0 }));
    const indices = await banco.busca<{ indexname: string }>(
      "SELECT indexname FROM pg_indexes WHERE schemaname='public'",
    );
    assert.ok(
      indices.some((indice) => indice.indexname === "lots_leader_status"),
    );
    assert.ok(!indices.some((indice) => indice.indexname === "bids_lot"));
  } finally {
    await banco.fechar();
  }
});
