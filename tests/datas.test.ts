import assert from "node:assert/strict";
import test from "node:test";
import {
  converterParaIso,
  dataLocal,
  formatarData,
  formatarDataHora,
  formatarDataAcervo,
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

test("datas do acervo são legíveis sem alterar períodos históricos", () => {
  assert.equal(formatarDataAcervo("1964-12-08T05:00:00"), "08/12/1964, 05:00:00");
  assert.equal(formatarDataAcervo("1964-12-08"), "08/12/1964");
  assert.equal(formatarDataAcervo("2026-10-22T18:17:00-03:00"), formatarDataHora("2026-10-22T18:17:00-03:00"));
  for (const valor of ["1877", "c. 1915–26", "2026-02-30", "1964-12-08T25:00:00", "https://museu.org/1964-12-08", "Exposição em 1964", ""]) {
    assert.equal(formatarDataAcervo(valor), valor);
  }
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
