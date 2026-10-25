import { test } from "node:test";
import assert from "node:assert/strict";
import { apelidoParticipante } from "../src/lib/apelido-participante";

test("apelido público é estável e não modifica o identificador original", () => {
  const codigo = "Participante 49aa691e";
  assert.equal(apelidoParticipante(codigo), apelidoParticipante(codigo));
  assert.match(apelidoParticipante(codigo), /^[A-Za-zÀ-ÿ]+ [A-Z]\.$/);
  assert.notEqual(apelidoParticipante(codigo), apelidoParticipante("Participante a1fffe3b"));
  assert.equal(codigo, "Participante 49aa691e");
  assert.equal(apelidoParticipante("Apelido existente"), "Apelido existente");
});
