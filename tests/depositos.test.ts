import { listarComprovantesDeposito } from "../src/servidor/comandos/comprovantes-deposito";
import { centavosColados } from "../src/lib/valor-monetario";
import { test } from "node:test";
import assert from "node:assert/strict";
import { criarBancoLocal } from "../src/servidor/banco";
import { esquema } from "../src/servidor/esquema";
import { ServicoLeiloes } from "../src/servidor/leilao";
import {
  iniciarDeposito,
  processarDeposito,
} from "../src/servidor/comandos/depositos";
import { validarCartaoTeste, bandeiraCartao } from "../src/lib/cartao-teste";
import type { ContextoComando } from "../src/servidor/comandos/contexto";
test("depósito simulado confirma uma vez, protege titular, respeita tempo e cancelamento", async () => {
  const db = await criarBancoLocal();
  try {
    await db.busca(esquema);
    const service = new ServicoLeiloes(
      db,
      "segredo-de-teste-deposito-com-32-caracteres",
    );
    const id = await service.criarUsuario(
      "deposito@teste.local",
      "Ana",
      "hash",
      "bidder",
    );
    const contexto: ContextoComando = {
      db,
      service,
      token: "",
      user: {
        id,
        name: "Ana",
        email: "deposito@teste.local",
        alias: "ana",
        role: "bidder",
      },
    };
    const agora = Date.now();
    await assert.rejects(
      iniciarDeposito(
        { ...contexto, user: undefined },
        { valor: 100, metodo: "pix" },
      ),
    );
    await assert.rejects(
      iniciarDeposito(contexto, { valor: 0, metodo: "pix" }),
    );
    await assert.rejects(
      iniciarDeposito(contexto, {
        valor: 100,
        metodo: "card",
        numero: "4111111111111111",
      }),
    );
    const deposito = await iniciarDeposito(
      contexto,
      { valor: centavosColados("100,00")!, metodo: "pix" },
      agora,
    );
    assert.equal(
      (
        await iniciarDeposito(
          contexto,
          { valor: centavosColados("100,00")!, metodo: "pix" },
          agora,
        )
      ).id,
      deposito.id,
    );
    await assert.rejects(
      processarDeposito(
        { ...contexto, user: { ...contexto.user!, id: "outra-conta" } },
        deposito.id,
        "acompanhar",
        agora,
      ),
    );
    assert.equal(
      (
        await processarDeposito(
          contexto,
          deposito.id,
          "acompanhar",
          agora + 29000,
        )
      ).estado,
      "pending",
    );
    await Promise.all([
      processarDeposito(contexto, deposito.id, "qr", agora + 30000),
      processarDeposito(contexto, deposito.id, "acompanhar", agora + 30000),
    ]);
    assert.equal(
      Number(
        (await db.busca("SELECT balance FROM users WHERE id=$1", [id]))[0]
          .balance,
      ),
      10000,
    );
    assert.equal(
      Number(
        (
          await db.busca("SELECT count(*) AS total FROM ledger WHERE id=$1", [
            deposito.id,
          ])
        )[0].total,
      ),
      1,
    );
    const recibos = await listarComprovantesDeposito(contexto);
    assert.equal(recibos.comprovantes.length, 1);
    assert.equal(recibos.comprovantes[0].valor, 10000);
    assert.equal(recibos.comprovantes[0].id, deposito.id);
    assert.equal(
      recibos.comprovantes[0].confirmadoEm,
      new Date(agora + 30000).toISOString(),
    );
    assert.equal(
      (
        await listarComprovantesDeposito({
          ...contexto,
          user: { ...contexto.user!, id: "outra-conta" },
        })
      ).comprovantes.length,
      0,
    );
    await assert.rejects(
      listarComprovantesDeposito({ ...contexto, user: undefined }),
    );
    assert.equal(
      (await listarComprovantesDeposito(contexto, 2)).comprovantes.length,
      0,
    );
    const cancelado = await iniciarDeposito(
      contexto,
      { valor: 100, metodo: "pix" },
      agora,
    );
    await processarDeposito(contexto, cancelado.id, "cancelar", agora);
    assert.equal(
      (await processarDeposito(contexto, cancelado.id, "qr", agora + 30000))
        .estado,
      "cancelled",
    );
    const expirado = await iniciarDeposito(
      contexto,
      { valor: 100, metodo: "pix" },
      agora,
    );
    assert.equal(
      (await processarDeposito(contexto, expirado.id, "qr", agora + 600001))
        .estado,
      "expired",
    );
    const cartao = await iniciarDeposito(
      contexto,
      { valor: 500, metodo: "card" },
      agora,
    );
    await assert.rejects(processarDeposito(contexto, cartao.id, "qr", agora));
    assert.equal(
      (await processarDeposito(contexto, cartao.id, "acompanhar", agora + 3000))
        .estado,
      "confirmed",
    );
    assert.equal(
      Number(
        (await db.busca("SELECT balance FROM users WHERE id=$1", [id]))[0]
          .balance,
      ),
      10500,
    );
  } finally {
    await db.fechar();
  }
});
test("cartão fictício identifica bandeira e rejeita número, validade e CVV inválidos", () => {
  assert.equal(bandeiraCartao("4111 1111 1111 1111")?.type, "visa");
  assert.equal(
    validarCartaoTeste("Ana Teste", "4111111111111111", "12/99", "123"),
    "",
  );
  assert.notEqual(
    validarCartaoTeste("Ana Teste", "4111111111111112", "12/99", "123"),
    "",
  );
  assert.notEqual(
    validarCartaoTeste("Ana Teste", "4111111111111111", "13/99", "123"),
    "",
  );
  assert.notEqual(
    validarCartaoTeste("Ana Teste", "4111111111111111", "12/99", "1"),
    "",
  );
});
