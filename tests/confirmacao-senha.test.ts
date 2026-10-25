import { test } from "node:test";
import assert from "node:assert/strict";
import { esquemaConfirmacaoSenha } from "../src/lib/confirmacao-senha";

test("cadastro exige confirmação idêntica e respeita os limites da senha", () => {
  const password = "UmaSenhaDeTeste123";
  assert.equal(esquemaConfirmacaoSenha.safeParse({ password }).success, false);
  assert.equal(
    esquemaConfirmacaoSenha.safeParse({
      password,
      confirmacaoSenha: "diferente",
    }).success,
    false,
  );
  assert.equal(
    esquemaConfirmacaoSenha.safeParse({ password, confirmacaoSenha: password })
      .success,
    true,
  );
  for (const tamanho of [11, 129]) {
    const senha = "a".repeat(tamanho);
    assert.equal(
      esquemaConfirmacaoSenha.safeParse({
        password: senha,
        confirmacaoSenha: senha,
      }).success,
      false,
    );
  }
  for (const tamanho of [12, 128]) {
    const senha = "a".repeat(tamanho);
    assert.equal(
      esquemaConfirmacaoSenha.safeParse({
        password: senha,
        confirmacaoSenha: senha,
      }).success,
      true,
    );
  }
});
