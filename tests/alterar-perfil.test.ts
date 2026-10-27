import { test } from "node:test";
import assert from "node:assert/strict";
import { criarBancoLocal } from "../src/servidor/banco";
import { esquema } from "../src/servidor/esquema";
import { ServicoLeiloes } from "../src/servidor/leilao";
import { salvarNome } from "../src/servidor/comandos/perfil";
import { alterarSenha } from "../src/servidor/comandos/alterar-senha";
import {
  gerarHashSenha,
  verificarSenha,
  sessao,
  hashToken,
} from "../src/servidor/seguranca";
import type { ContextoComando } from "../src/servidor/comandos/contexto";

test("perfil protege dados fixos e troca senha encerrando apenas outras sessões da conta", async () => {
  const banco = await criarBancoLocal();
  try {
    await banco.busca(esquema);
    const servico = new ServicoLeiloes(
      banco,
      "segredo-teste-perfil-longo-com-32-caracteres",
    );
    const antiga = "senha-antiga-teste";
    const nova = "senha-nova-de-teste";
    const id = await servico.criarUsuario(
      "ana@perfil.test",
      "Ana",
      await gerarHashSenha(antiga),
      "bidder",
    );
    const outro = await servico.criarUsuario(
      "bruno@perfil.test",
      "Bruno",
      await gerarHashSenha(antiga),
      "bidder",
    );
    const token = await sessao(banco, id);
    const segundo = await sessao(banco, id);
    const terceiro = await sessao(banco, outro);
    const contexto: ContextoComando = {
      db: banco,
      service: servico,
      user: undefined,
      token,
    };
    await assert.rejects(salvarNome(contexto, "Ana Silva"));
    await assert.rejects(alterarSenha(contexto, {}));
    contexto.user = {
      id,
      name: "Ana",
      email: "ana@perfil.test",
      alias: "teste",
      role: "bidder",
    };
    await assert.rejects(
      salvarNome(contexto, {
        nome: "Outra",
        email: "outra@teste.local",
        id: outro,
      }),
    );
    await assert.rejects(salvarNome(contexto, " "));
    await salvarNome(contexto, " Ana Silva ");
    const [conta] = await banco.busca(
      "SELECT name,email,role FROM users WHERE id=$1",
      [id],
    );
    assert.equal(conta.name, "Ana Silva");
    assert.equal(conta.email, "ana@perfil.test");
    assert.equal(conta.role, "bidder");
    await assert.rejects(
      alterarSenha(contexto, {
        senhaAtual: "incorreta",
        password: nova,
        confirmacaoSenha: nova,
      }),
    );
    await assert.rejects(
      alterarSenha(contexto, {
        senhaAtual: antiga,
        password: nova,
        confirmacaoSenha: "diferente",
      }),
    );
    await assert.rejects(
      alterarSenha(contexto, {
        senhaAtual: antiga,
        password: antiga,
        confirmacaoSenha: antiga,
      }),
    );
    await alterarSenha(contexto, {
      senhaAtual: antiga,
      password: nova,
      confirmacaoSenha: nova,
    });
    const [alterada] = await banco.busca<{ password_hash: string }>(
      "SELECT password_hash FROM users WHERE id=$1",
      [id],
    );
    assert.equal(await verificarSenha(nova, alterada.password_hash), true);
    assert.equal(await verificarSenha(antiga, alterada.password_hash), false);
    const sessoes = await banco.busca("SELECT token_hash FROM sessions");
    assert.equal(
      sessoes.some((item) => item.token_hash === hashToken(segundo)),
      false,
    );
    assert.equal(
      sessoes.some((item) => item.token_hash === hashToken(token)),
      true,
    );
    assert.equal(
      sessoes.some((item) => item.token_hash === hashToken(terceiro)),
      true,
    );
  } finally {
    await banco.fechar();
  }
});
