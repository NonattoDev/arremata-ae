import test from "node:test";
import assert from "node:assert/strict";
import {
  adicionarAcompanhamento,
  lerAcompanhamento,
} from "../src/lib/acompanhamento";

const ids = Array.from(
  { length: 6 },
  (_, indice) => `00000000-0000-4000-8000-${String(indice).padStart(12, "0")}`,
);

test("acompanhamento aceita cinco lotes, ignora duplicata e recusa o sexto", () => {
  const cinco = ids.slice(0, 5);
  assert.deepEqual(adicionarAcompanhamento(cinco, ids[0]), cinco);
  assert.throws(() => adicionarAcompanhamento(cinco, ids[5]), /5 leilões/);
  assert.deepEqual(adicionarAcompanhamento(cinco.slice(1), ids[5]), [
    ...cinco.slice(1),
    ids[5],
  ]);
});

test("seleção persistida valida dados, remove duplicados e limita a cinco", () => {
  assert.deepEqual(lerAcompanhamento("{quebrado"), []);
  assert.deepEqual(lerAcompanhamento('{"ids":[]}'), []);
  assert.deepEqual(
    lerAcompanhamento(
      JSON.stringify([ids[0], ids[0], null, "inválido", ...ids]),
    ),
    ids.slice(0, 5),
  );
});
