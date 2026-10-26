import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { criarBancoLocal, criarBancoPostgres } from "../src/servidor/banco";
import { ServicoLeiloes } from "../src/servidor/leilao";
import { esquema } from "../src/servidor/esquema";
import { completarCadastro } from "../src/servidor/comandos/completar-cadastro";

let banco: Awaited<ReturnType<typeof criarBancoLocal>>;
let servico: ServicoLeiloes, servicoConcorrente: ServicoLeiloes;
let bancoConcorrente: ReturnType<typeof criarBancoPostgres> | undefined;
// Use apenas um banco de validação descartável nesta variável.
const enderecoPostgres = process.env.POSTGRES_TEST_URL;
let relogio = Date.parse("2026-10-22T12:00:00Z");
let leiloeiro: string, ana: string, bruno: string;
const item = {
  externalId: "27992",
  title: "Obra de teste",
  artist: "Artista",
  image: "data:image/png;base64,AA==",
  sourceUrl: "https://www.artic.edu/artworks/27992",
  date: "1888",
};
before(async () => {
  banco = enderecoPostgres
    ? criarBancoPostgres(enderecoPostgres)
    : await criarBancoLocal();
  if (!enderecoPostgres) await banco.busca(esquema);
  servico = new ServicoLeiloes(
    banco,
    "test-audit-secret-with-more-than-32-characters",
    () => relogio,
  );
  bancoConcorrente = enderecoPostgres
    ? criarBancoPostgres(enderecoPostgres)
    : undefined;
  servicoConcorrente = bancoConcorrente
    ? new ServicoLeiloes(
        bancoConcorrente,
        "test-audit-secret-with-more-than-32-characters",
        () => relogio,
      )
    : servico;
  leiloeiro = await servico.criarUsuario(
    "seller@test.local",
    "Vendedor",
    "hash",
    "seller",
  );
  ana = await servico.criarUsuario(
    "alice@test.local",
    "Alice",
    "hash",
    "bidder",
  );
  bruno = await servico.criarUsuario("bob@test.local", "Bob", "hash", "bidder");
  await banco.busca(
    "UPDATE users SET cpf='52998224725', nascimento='1990-01-01' WHERE id IN ($1,$2)",
    [ana, bruno],
  );
});
after(async () => {
  await banco?.fechar();
  await bancoConcorrente?.fechar();
});
test("exige CPF e nascimento, completa cadastro e impede substituir identidade", async () => {
  const idUsuario = await servico.criarUsuario(
    "pendente@test.local",
    "Pendente",
    "hash",
    "bidder",
  );
  const idLote = await lote();
  await servico.depositar(idUsuario, 20000);
  const contexto = {
    db: banco,
    service: servico,
    user: {
      id: idUsuario,
      name: "Pendente",
      email: "pendente@test.local",
      role: "bidder" as const,
      alias: "Pendente",
    },
    token: undefined,
  };
  await assert.rejects(
    servico.darLance(idUsuario, idLote, 10000),
    /CPF.*nascimento/,
  );
  await assert.rejects(
    completarCadastro(contexto, {
      cpf: "11111111111",
      nascimento: "1990-01-01",
    }),
  );
  await assert.rejects(
    completarCadastro(contexto, {
      cpf: "52998224725",
      nascimento: "2000-02-30",
    }),
  );
  await assert.rejects(
    completarCadastro(contexto, {
      cpf: "52998224725",
      nascimento: "2999-01-01",
    }),
  );
  await banco.busca("UPDATE users SET cpf='52998224725' WHERE id=$1", [
    idUsuario,
  ]);
  await assert.rejects(
    servico.darLance(idUsuario, idLote, 10000),
    /CPF.*nascimento/,
  );
  await completarCadastro(contexto, {
    cpf: "52998224725",
    nascimento: "1990-01-01",
  });
  await servico.darLance(idUsuario, idLote, 10000);
  assert.equal((await servico.obterLote(idLote, idUsuario)).isLeader, true);
  await assert.rejects(
    completarCadastro(contexto, {
      cpf: "52998224725",
      nascimento: "1991-01-01",
    }),
    /suporte/,
  );
});
const lote = (adicionais = {}) =>
  servico.criarLote(leiloeiro, {
    item,
    initial: 10000,
    increment: 1000,
    startsAt: new Date(relogio - 1000).toISOString(),
    endsAt: new Date(relogio + 600000).toISOString(),
    ...adicionais,
  });

test("impede lance de leiloeiro e cancelamento de lote alheio", async () => {
  const id = await lote();
  await assert.rejects(servico.darLance(leiloeiro, id, 10000), /licitante/i);
  await assert.rejects(servico.cancelar(ana, id), /leiloeiro|permissão/i);
  const outroLeiloeiro = await servico.criarUsuario(
    `other-seller-${Date.now()}@test.local`,
    "Outro vendedor",
    "hash",
    "seller",
  );
  await assert.rejects(servico.cancelar(outroLeiloeiro, id), /permissão/i);
  assert.equal((await servico.listarLotes(outroLeiloeiro, "seller")).length, 0);
  assert.equal((await servico.obterLote(id)).status, "live");
});
test("valida mínimo, saldo e liderança, liberando a reserva de quem foi superado", async () => {
  const id = await lote();
  await assert.rejects(servico.darLance(ana, id, 9000), /mínimo/i);
  await assert.rejects(servico.darLance(ana, id, 10000), /insuficiente/i);
  await servico.depositar(ana, 100000);
  await servico.depositar(bruno, 100000);
  await servico.darLance(ana, id, 10000);
  assert.equal((await servico.carteira(ana)).committed, 10000);
  await assert.rejects(servico.darLance(ana, id, 11000), /ganhando/i);
  await assert.rejects(servico.darLance(bruno, id, 10500), /mínimo/i);
  await servico.darLance(bruno, id, 11000);
  assert.equal((await servico.carteira(ana)).committed, 0);
  assert.equal((await servico.carteira(bruno)).available, 89000);
  assert.equal((await servico.obterLote(id)).bidCount, 2);
});
test("recusa valores inválidos e lances antecipados, aceitando o instante de abertura", async () => {
  await assert.rejects(servico.depositar(ana, -1), /valor/i);
  await assert.rejects(servico.depositar(ana, 0.5), /valor/i);
  const id = await lote({ startsAt: new Date(relogio + 1000).toISOString() });
  await assert.rejects(servico.darLance(ana, id, 10000), /iniciado/i);
  relogio += 1000;
  await servico.darLance(ana, id, 10000);
});
test("lances iguais simultâneos aceitam apenas um líder", async () => {
  const id = await lote();
  const resultados = await Promise.allSettled([
    servico.darLance(ana, id, 10000),
    servicoConcorrente.darLance(bruno, id, 10000),
  ]);
  assert.equal(
    resultados.filter((resultado) => resultado.status === "fulfilled").length,
    1,
  );
  assert.equal((await servico.auditar(id)).bids.length, 1);
});
test("lances simultâneos em lotes distintos não comprometem o mesmo saldo duas vezes", async () => {
  const usuario = await servico.criarUsuario(
    "poor@test.local",
    "Pouco saldo",
    "hash",
    "bidder",
  );
  await banco.busca(
    "UPDATE users SET cpf='52998224725', nascimento='1990-01-01' WHERE id=$1",
    [usuario],
  );
  await servico.depositar(usuario, 10000);
  const primeiro = await lote(),
    lanceBanco = await lote();
  const resultados = await Promise.allSettled([
    servico.darLance(usuario, primeiro, 10000),
    servicoConcorrente.darLance(usuario, lanceBanco, 10000),
  ]);
  assert.equal(
    resultados.filter((resultado) => resultado.status === "fulfilled").length,
    1,
  );
  assert.equal((await servico.carteira(usuario)).available, 0);
});
test("anti-sniping prorroga o fim para dois minutos após o lance aceito", async () => {
  const id = await lote({ endsAt: new Date(relogio + 30000).toISOString() });
  await servico.darLance(ana, id, 10000);
  assert.equal(
    new Date((await servico.obterLote(id)).endsAt).getTime(),
    relogio + 120000,
  );
});
test("liquida uma vez, recusa lance no encerramento e gera comprovante sem dados pessoais", async () => {
  const id = await lote({ endsAt: new Date(relogio + 130000).toISOString() });
  await servico.darLance(bruno, id, 10000);
  relogio += 130000;
  await assert.rejects(servico.darLance(ana, id, 20000), /encerrado/i);
  await Promise.all([servico.liquidar(), servicoConcorrente.liquidar()]);
  const transferencias = await banco.busca(
    "SELECT amount,kind FROM ledger WHERE lot_id=$1 ORDER BY amount",
    [id],
  );
  assert.deepEqual(
    transferencias.map((resultado: any) => [
      Number(resultado.amount),
      resultado.kind,
    ]),
    [
      [-10000, "purchase"],
      [10000, "sale"],
    ],
  );
  const comprovante = await servico.comprovante(id);
  assert.equal(comprovante.amount, 10000);
  assert.ok(!JSON.stringify(comprovante).includes("bob@test.local"));
  assert.ok(!JSON.stringify(comprovante).includes("Bob"));
});
test("encerra lotes vazios sem vencedor e oculta cancelados", async () => {
  const id = await lote({ endsAt: new Date(relogio + 1000).toISOString() });
  const cancelled = await lote();
  await servico.cancelar(leiloeiro, cancelled);
  relogio += 1000;
  await servico.liquidar();
  assert.equal((await servico.obterLote(id)).status, "closed");
  await assert.rejects(servico.comprovante(id), /arremate/i);
  assert.ok(
    !(await servico.listarLotes()).some(
      (loteBanco) => loteBanco.id === cancelled,
    ),
  );
});
test("auditoria detecta edição, exclusão intermediária ou final e inserção de lances por SQL", async () => {
  for (const alteracao of [
    "UPDATE bids SET amount = amount + 1 WHERE lot_id = $1",
    "DELETE FROM bids WHERE lot_id = $1 AND sequence = 1",
    "DELETE FROM bids WHERE lot_id = $1 AND sequence = 2",
    "INSERT INTO bids (id,lot_id,bidder_id,alias,amount,sequence,placed_at,previous_hash,hash) SELECT id || 'x',lot_id,bidder_id,alias,amount,3,placed_at,previous_hash,hash FROM bids WHERE lot_id=$1 AND sequence=2",
  ]) {
    const id = await lote();
    await servico.darLance(ana, id, 10000);
    await servico.darLance(bruno, id, 11000);
    assert.equal((await servico.auditar(id)).intact, true);
    await banco.busca(alteracao, [id]);
    assert.equal((await servico.auditar(id)).intact, false);
  }
});
test("recebimentos acima do limite de depósitos não bloqueiam a liquidação", async () => {
  await banco.busca("UPDATE users SET balance=1000000000000 WHERE id=$1", [
    leiloeiro,
  ]);
  const id = await lote({ endsAt: new Date(relogio + 130000).toISOString() });
  await servico.darLance(ana, id, 10000);
  relogio += 130000;
  await servico.liquidar();
  assert.equal((await servico.comprovante(id)).amount, 10000);
  assert.ok((await servico.carteira(leiloeiro)).total > 1000000000000);
  assert.ok(Array.isArray(await servico.listarLotes()));
});

test("auditoria pagina sem repetir lances e detecta alteração fora da página", async () => {
  const id = await lote();
  await servico.depositar(ana, 1000000);
  await servico.depositar(bruno, 1000000);
  for (let indice = 0; indice < 30; indice++) {
    await servico.darLance(indice % 2 ? bruno : ana, id, 10000 + indice * 1000);
  }
  const primeira = await servico.auditar(id, 1);
  const segunda = await servico.auditar(id, 2);
  assert.equal(primeira.total, 30);
  assert.equal(primeira.totalPaginas, 2);
  assert.equal(primeira.bids.length, 25);
  assert.equal(segunda.bids.length, 5);
  assert.equal(
    new Set([...primeira.bids, ...segunda.bids].map((lance) => lance.sequence))
      .size,
    30,
  );
  assert.equal((await servico.auditar(id, 999)).pagina, 2);
  await banco.busca("UPDATE bids SET amount=1 WHERE lot_id=$1 AND sequence=1", [
    id,
  ]);
  assert.equal((await servico.auditar(id, 1)).intact, false);
});
