import { validarCpf, normalizarCpf } from "@/lib/cpf";
import { ErroDominio } from "../leilao";
import { z } from "zod";
import { avatares } from "@/lib/avatares";
import { exigirUsuario, type ContextoComando } from "./contexto";

export async function salvarNome(contexto: ContextoComando, entrada: unknown) {
  const usuario = await exigirUsuario(contexto);
  const nome = z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(80, "Use até 80 caracteres.")
    .parse(entrada);
  await contexto.db.busca("UPDATE users SET name=$1 WHERE id=$2", [
    nome,
    usuario.id,
  ]);
  return { nome };
}

export async function salvarAvatar(
  contexto: ContextoComando,
  entrada: unknown,
) {
  const usuario = await exigirUsuario(contexto);
  const avatar = z
    .string()
    .refine(
      (valor) => avatares.includes(valor),
      "Escolha um avatar da galeria.",
    )
    .parse(entrada);
  await contexto.db.busca("UPDATE users SET avatar=$1 WHERE id=$2", [
    avatar,
    usuario.id,
  ]);
  return { avatar };
}

export async function salvarCpf(contexto: ContextoComando, entrada: unknown) {
  const usuario = await exigirUsuario(contexto);
  const cpf = z
    .string()
    .max(14)
    .regex(/^[0-9.\-]+$/)
    .refine(validarCpf, "Informe um CPF válido.")
    .transform(normalizarCpf)
    .parse(entrada);
  // A condição no UPDATE impede duas requisições de substituir o documento.
  const alterados = await contexto.db.busca(
    "UPDATE users SET cpf=$1 WHERE id=$2 AND cpf IS NULL RETURNING id",
    [cpf, usuario.id],
  );
  if (!alterados.length)
    throw new ErroDominio(
      "CPF já cadastrado. Para corrigir, entre em contato com o suporte.",
      409,
    );
  return { salvo: true };
}

export async function salvarDadosPerfil(
  contexto: ContextoComando,
  entrada: unknown,
) {
  const usuario = await exigirUsuario(contexto);
  const dados = z
    .object({
      nome: z
        .string()
        .trim()
        .min(2, "Informe pelo menos 2 caracteres.")
        .max(80),
      cpf: z
        .string()
        .max(14)
        .regex(/^[0-9.\-]+$/)
        .refine(validarCpf, "Informe um CPF válido.")
        .transform(normalizarCpf)
        .optional(),
    })
    .strict()
    .parse(entrada);
  // Um único UPDATE grava os campos juntos e protege o CPF mesmo em requisições concorrentes.
  const alterados = await contexto.db.busca(
    "UPDATE users SET name=$1, cpf=COALESCE($2,cpf) WHERE id=$3 AND ($2::text IS NULL OR cpf IS NULL) RETURNING id",
    [dados.nome, dados.cpf ?? null, usuario.id],
  );
  if (!alterados.length)
    throw new ErroDominio(
      "CPF já cadastrado. Atualize a página; para corrigir, entre em contato com o suporte.",
      409,
    );
  return { salvo: true };
}
