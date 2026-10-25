import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { criarBancoPostgres } from "../src/servidor/banco/postgres";
import { ServicoLeiloes } from "../src/servidor/leilao";
import { esquema } from "../src/servidor/esquema";

// Exercita Prisma, pg e protocolo PostgreSQL; a concorrência real exige banco com conexões independentes.
test("adaptador Prisma persiste lances, desfaz falhas e liquida comprovantes assinados", async () => {
  const motor = await PGlite.create();
  await motor.exec(esquema);
  const servidor = new PGLiteSocketServer({
    db: motor,
    host: "127.0.0.1",
    port: 15439,
  });
  await servidor.start();
  const banco = criarBancoPostgres(
    "postgresql://postgres:postgres@127.0.0.1:15439/postgres?sslmode=disable",
  );
  try {
    let agora = Date.parse("2026-10-22T12:00:00Z");
    const servico = new ServicoLeiloes(
      banco,
      "adapter-test-secret-with-at-least-32-characters",
      () => agora,
    );
    const leiloeiro = await servico.criarUsuario(
      "seller@test.example",
      "Seller",
      "test",
      "seller",
    );
    const licitante = await servico.criarUsuario(
      "bidder@test.example",
      "Bidder",
      "test",
      "bidder",
    );
    await servico.depositar(licitante, 1000);
    const lote = await servico.criarLote(leiloeiro, {
      item: {
        externalId: "1",
        title: "Snapshot",
        artist: "Artist",
        date: "1900",
        image: "data:image/jpeg;base64,AA==",
        sourceUrl: "https://example.test/art/1",
      },
      initial: 100,
      increment: 10,
      startsAt: new Date(agora - 1000).toISOString(),
      endsAt: new Date(agora + 600000).toISOString(),
    });
    await servico.darLance(licitante, lote, 100);
    assert.equal((await servico.auditar(lote)).intact, true);
    await assert.rejects(
      banco.transacionar(async (transacao) => {
        await transacao.busca("UPDATE users SET balance=0 WHERE id=$1", [
          licitante,
        ]);
        throw new Error("rollback proof");
      }),
      /rollback proof/,
    );
    assert.equal((await servico.carteira(licitante)).total, 1000);
    agora += 600001;
    await servico.liquidar();
    await servico.liquidar();
    assert.equal((await servico.carteira(licitante)).total, 900);
    assert.equal((await servico.carteira(leiloeiro)).total, 100);
    assert.equal((await servico.comprovante(lote)).amount, 100);
    assert.equal((await servico.auditar(lote)).intact, true);
  } finally {
    await banco.fechar();
    await servidor.stop();
    await motor.close();
  }
});
