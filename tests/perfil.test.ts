import { test } from "node:test";
import assert from "node:assert/strict";
import { criarBancoLocal } from "../src/servidor/banco";
import { esquema } from "../src/servidor/esquema";
import { ServicoLeiloes, ErroDominio } from "../src/servidor/leilao";
import { salvarAvatar } from "../src/servidor/comandos/perfil";
import type { ContextoComando } from "../src/servidor/comandos/contexto";
import { salvarFotoPerfil } from "../src/servidor/comandos/foto-perfil";
import sharp from "sharp";

test("avatar exige sessão, aceita apenas galeria e altera somente a própria conta", async () => {
  const banco = await criarBancoLocal();
  try {
    await banco.busca(esquema);
    const servico = new ServicoLeiloes(
      banco,
      "teste-avatar-segredo-com-mais-de-32-caracteres",
    );
    const contexto: ContextoComando = {
      db: banco,
      service: servico,
      user: undefined,
      token: undefined,
    };
    await assert.rejects(
      salvarFotoPerfil(contexto, "data:image/jpeg;base64,AA=="),
      (erro) => erro instanceof ErroDominio && erro.status === 401,
    );
    await assert.rejects(
      salvarAvatar(contexto, "avatar-1"),
      (erro) => erro instanceof ErroDominio && erro.status === 401,
    );
    const id = await servico.criarUsuario(
      "perfil@teste.local",
      "Ana",
      "teste",
      "bidder",
    );
    const outro = await servico.criarUsuario(
      "outro@teste.local",
      "Bruno",
      "teste",
      "bidder",
    );
    contexto.user = {
      id,
      name: "Ana",
      email: "perfil@teste.local",
      alias: "Ana",
      role: "bidder",
    };
    await assert.rejects(salvarAvatar(contexto, "../../imagem"));
    await assert.rejects(
      salvarAvatar(contexto, { avatar: "avatar-2", id: outro }),
    );
    await salvarAvatar(contexto, "avatar-4");
    assert.equal(
      (await banco.busca("SELECT avatar FROM users WHERE id=$1", [id]))[0]
        .avatar,
      "avatar-4",
    );
    await assert.rejects(
      salvarFotoPerfil(contexto, "data:image/jpeg;base64,AA=="),
    );
    await assert.rejects(
      salvarFotoPerfil(contexto, "data:image/svg+xml;base64,AA=="),
    );
    await assert.rejects(
      salvarFotoPerfil(
        contexto,
        "data:image/jpeg;base64," + "A".repeat(700_000),
      ),
    );
    const original = await sharp({
      create: { width: 640, height: 480, channels: 3, background: "orange" },
    })
      .jpeg()
      .toBuffer();
    const foto = await salvarFotoPerfil(
      contexto,
      `data:image/jpeg;base64,${original.toString("base64")}`,
    );
    const metadados = await sharp(
      Buffer.from(foto.avatar.split(",")[1], "base64"),
    ).metadata();
    assert.equal(metadados.width, 320);
    assert.equal(metadados.height, 320);
    assert.equal(metadados.exif, undefined);
    assert.equal(
      (await banco.busca("SELECT avatar FROM users WHERE id=$1", [id]))[0]
        .avatar,
      foto.avatar,
    );
    await salvarAvatar(contexto, "avatar-2");
    assert.equal(
      (await banco.busca("SELECT avatar FROM users WHERE id=$1", [id]))[0]
        .avatar,
      "avatar-2",
    );
    assert.equal(
      (await banco.busca("SELECT avatar FROM users WHERE id=$1", [outro]))[0]
        .avatar,
      null,
    );
  } finally {
    await banco.fechar();
  }
});
