import { test } from "node:test";
import assert from "node:assert/strict";
import { consultarApi } from "../src/lib/api";

test("erros HTTP HTML e JSON inválido recebem mensagem pública", async (contexto) => {
  const requisicao = contexto.mock.method(
    globalThis,
    "fetch",
    async () => new Response("<html>Timeout</html>", { status: 504 }),
  );
  await assert.rejects(consultarApi("catalog"), /Não foi possível carregar/);
  requisicao.mock.mockImplementation(
    async () => new Response("inválido", { status: 200 }),
  );
  await assert.rejects(consultarApi("catalog"), /Resposta inválida/);
  requisicao.mock.mockImplementation(async () =>
    Response.json({ error: "Sessão expirada" }, { status: 401 }),
  );
  await assert.rejects(consultarApi("catalog"), /Sessão expirada/);
});
