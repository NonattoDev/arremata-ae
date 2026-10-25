import { test } from "node:test";
import assert from "node:assert/strict";
import { validarCpf, formatarCpf } from "../src/lib/cpf";
import { salvarCpf, salvarDadosPerfil } from "../src/servidor/comandos/perfil";
import { criarBancoLocal } from "../src/servidor/banco";
import { esquema } from "../src/servidor/esquema";
import { ServicoLeiloes } from "../src/servidor/leilao";
import type { ContextoComando } from "../src/servidor/comandos/contexto";
test("CPF valida dígitos, normaliza e só pode ser cadastrado uma vez na própria conta", async () => {
  assert.equal(validarCpf("111.111.111-11"), false);
  assert.equal(validarCpf("529.982.247-24"), false);
  assert.equal(validarCpf("529.982.247-25"), true);
  assert.equal(formatarCpf("52998224725"), "529.982.247-25");
  const db = await criarBancoLocal();
  try {
    await db.busca(esquema);
    const service = new ServicoLeiloes(
      db,
      "segredo-de-teste-com-mais-de-32-caracteres",
    );
    const id = await service.criarUsuario(
      "cpf@teste.local",
      "Teste",
      "hash",
      "bidder",
    );
    const outro = await service.criarUsuario(
      "outro@teste.local",
      "Outro",
      "hash",
      "bidder",
    );
    const contexto: ContextoComando = {
      db,
      service,
      user: undefined,
      token: undefined,
    };
    await assert.rejects(salvarCpf(contexto, "52998224725"));
    contexto.user = {
      id,
      name: "Teste",
      email: "cpf@teste.local",
      alias: "teste",
      role: "bidder",
    };
    await assert.rejects(salvarCpf(contexto, "11111111111"));
    await assert.rejects(
      salvarCpf(contexto, { cpf: "52998224725", id: outro }),
    );
    await assert.rejects(
      salvarDadosPerfil(contexto, { nome: "Não salvar", cpf: "11111111111" }),
    );
    const [antes] = await db.busca("SELECT name,cpf FROM users WHERE id=$1", [
      id,
    ]);
    assert.equal(antes.name, "Teste");
    assert.equal(antes.cpf, null);
    await salvarDadosPerfil(contexto, {
      nome: "Nome e CPF juntos",
      cpf: "529.982.247-25",
    });
    await assert.rejects(
      salvarDadosPerfil(contexto, {
        nome: "Não substituir",
        cpf: "11144477735",
      }),
    );
    const [junto] = await db.busca("SELECT name FROM users WHERE id=$1", [id]);
    assert.equal(junto.name, "Nome e CPF juntos");
    await salvarDadosPerfil(contexto, { nome: "Nome atualizado" });
    await assert.rejects(
      salvarCpf(contexto, "111.444.777-35"),
      /já cadastrado/,
    );
    const [salvo] = await db.busca("SELECT cpf FROM users WHERE id=$1", [id]);
    const [intacto] = await db.busca("SELECT cpf FROM users WHERE id=$1", [
      outro,
    ]);
    assert.equal(salvo.cpf, "52998224725");
    assert.equal(intacto.cpf, null);
  } finally {
    await db.fechar();
  }
});
