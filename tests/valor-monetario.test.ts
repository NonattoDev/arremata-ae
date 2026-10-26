import { test } from "node:test";
import assert from "node:assert/strict";
import {
  centavosDigitados,
  centavosColados,
  formatarValorCampo,
} from "../src/lib/valor-monetario";
test("moeda: digitação em centavos, colagem brasileira, apagar e limites", () => {
  assert.equal(centavosDigitados("1"), 1);
  assert.equal(centavosDigitados("1.234,56"), 123456);
  assert.equal(centavosDigitados(""), 0);
  assert.equal(formatarValorCampo(123456), "1.234,56");
  assert.equal(centavosColados("R$ 1.234,56"), 123456);
  assert.equal(centavosColados("1000"), 100000);
  assert.equal(centavosColados("1.000"), 100000);
  assert.equal(centavosColados("0,01"), 1);
  assert.equal(centavosColados("10,5"), 1050);
  for (const texto of ["-10", "1e3", "abc", "1,234", "10000001"])
    assert.equal(centavosColados(texto), null);
  assert.equal(centavosDigitados("1000000001"), null);
});
