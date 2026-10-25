import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectarNovosLances,
  selecionarLancesAudiveis,
} from "../src/lib/novos-lances";

test("só leilões acompanhados e não silenciados podem emitir aviso", () => {
  const lotes = [
    { id: "a", bidCount: 4 },
    { id: "b", bidCount: 9 },
    { id: "c", bidCount: 2 },
  ];
  assert.deepEqual(selecionarLancesAudiveis(lotes, [], []), []);
  assert.deepEqual(selecionarLancesAudiveis(lotes, ["a", "b"], ["b"]), [
    lotes[0],
  ]);
  const anteriores = new Map([
    ["a", 4],
    ["b", 8],
    ["c", 1],
  ]);
  assert.equal(
    detectarNovosLances(
      anteriores,
      selecionarLancesAudiveis(lotes, ["a", "b"], ["b"]),
    ),
    false,
  );
  assert.equal(
    detectarNovosLances(
      anteriores,
      selecionarLancesAudiveis(lotes, ["a", "b"], []),
    ),
    true,
  );
});

test("ignora carga inicial e lotes recém-descobertos", () => {
  assert.equal(
    detectarNovosLances(new Map(), [{ id: "a", bidCount: 8 }]),
    false,
  );
});
test("avisa somente quando a contagem de um lote conhecido aumenta", () => {
  const anteriores = new Map([["a", 3]]);
  assert.equal(
    detectarNovosLances(anteriores, [{ id: "a", bidCount: 4 }]),
    true,
  );
  assert.equal(
    detectarNovosLances(anteriores, [{ id: "a", bidCount: 3 }]),
    false,
  );
  assert.equal(
    detectarNovosLances(anteriores, [{ id: "a", bidCount: 2 }]),
    false,
  );
  assert.equal(detectarNovosLances(anteriores, []), false);
});
