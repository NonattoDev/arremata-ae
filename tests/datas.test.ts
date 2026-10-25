import assert from "node:assert/strict";
import test from "node:test";
import {
  converterParaIso,
  dataLocal,
  formatarData,
  formatarDataHora,
} from "../src/lib/datas";

test("conversão de datas preserva o instante informado com fuso", () => {
  assert.equal(
    converterParaIso("2026-10-22T18:17:00-03:00"),
    "2026-10-22T21:17:00.000Z",
  );
  assert.equal(
    dataLocal("2026-10-22T18:17:00-03:00").diff(
      dataLocal("2026-10-22T21:15:00Z"),
      "second",
    ),
    120,
  );
});

test("datas locais são apresentadas em português", () => {
  assert.equal(formatarData("2026-10-22T18:17:00"), "22/10/2026");
  assert.equal(formatarDataHora("2026-10-22T18:17:00"), "22/10/2026, 18:17:00");
  assert.equal(dataLocal("2026-10-22").format("MMMM"), "outubro");
});

test("conversão rejeita entrada inválida", () => {
  assert.throws(() => converterParaIso(""), /Informe uma data válida/);
  assert.throws(() => converterParaIso("sem data"), /Informe uma data válida/);
});
