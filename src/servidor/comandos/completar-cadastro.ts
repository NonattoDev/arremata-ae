import { z } from "zod";
import { validarCpf, normalizarCpf } from "@/lib/cpf";
import { validarNascimento } from "@/lib/dados-participacao";
import { exigirUsuario, type ContextoComando } from "./contexto";
import { ErroDominio } from "../leilao";

export async function completarCadastro(
  contexto: ContextoComando,
  entrada: unknown,
) {
  const usuario = await exigirUsuario(contexto);
  const dados = z
    .object({
      cpf: z
        .string()
        .max(14)
        .refine(validarCpf, "Informe um CPF válido.")
        .transform(normalizarCpf),
      nascimento: z
        .string()
        .refine(
          (valor) => validarNascimento(valor),
          "Informe uma data de nascimento válida.",
        ),
    })
    .strict()
    .parse(entrada);
  const alterados = await contexto.db.busca(
    `UPDATE users SET cpf=COALESCE(cpf,$1), nascimento=COALESCE(nascimento,$2::date)
     WHERE id=$3 AND (cpf IS NULL OR cpf=$1)
     AND (nascimento IS NULL OR nascimento=$2::date) RETURNING id`,
    [dados.cpf, dados.nascimento, usuario.id],
  );
  if (!alterados.length)
    throw new ErroDominio(
      "Dados já cadastrados. Para corrigir, procure o suporte.",
      409,
    );
  return { salvo: true };
}
