import { test } from "node:test";
import assert from "node:assert/strict";
import { esquemaPreferenciasNovidades, preferenciasVazias } from "../src/lib/preferencias-novidades";
const base = { ...preferenciasVazias, loteId: "db317071-7967-440b-af4e-941161dc5eed" };
test("contatos de novidades são obrigatórios somente nos canais escolhidos", () => {
  assert.equal(esquemaPreferenciasNovidades.safeParse(base).success, true);
  assert.equal(esquemaPreferenciasNovidades.safeParse({...base,whatsapp:true}).success, false);
  assert.equal(esquemaPreferenciasNovidades.safeParse({...base,telegram:true}).success, false);
  assert.equal(esquemaPreferenciasNovidades.safeParse({...base,whatsapp:true,numeroWhatsapp:"123"}).success, false);
  assert.equal(esquemaPreferenciasNovidades.safeParse({...base,telegram:true,usuarioTelegram:"https://t.me/ana"}).success, false);
});
test("normaliza contatos e remove os dados dos canais desmarcados", () => {
  const dados=esquemaPreferenciasNovidades.parse({...base,whatsapp:true,telegram:true,numeroWhatsapp:"+55 (71) 99999-9999",usuarioTelegram:"@Teste_Local"});
  assert.equal(dados.numeroWhatsapp,"+5571999999999");
  assert.equal(dados.usuarioTelegram,"@teste_local");
  const removidos=esquemaPreferenciasNovidades.parse({...dados,whatsapp:false,telegram:false});
  assert.equal(removidos.numeroWhatsapp,"");
  assert.equal(removidos.usuarioTelegram,"");
});
