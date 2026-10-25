import { ZodError } from "zod";
import { ErroDominio } from "./leilao";

export function erroPublico(erro: unknown) {
  if (erro instanceof ErroDominio)
    return { error: erro.message, status: erro.status };
  if (erro instanceof ZodError)
    return {
      error:
        "Confira os campos: valores válidos, e-mail e senha com pelo menos 12 caracteres.",
      status: 400,
    };
  if (erro instanceof SyntaxError)
    return { error: "Requisição inválida.", status: 400 };
  const codigo = (erro as { code?: string; meta?: { code?: string } })?.code;
  const codigoSql = (erro as { meta?: { code?: string } })?.meta?.code;
  if (codigo === "23505" || codigo === "P2002" || codigoSql === "23505")
    return { error: "Este cadastro já existe.", status: 409 };
  console.error(
    "Falha na operação",
    erro instanceof Error ? erro.message : "desconhecido",
  );
  return {
    error: "Não foi possível concluir. Tente novamente em instantes.",
    status: 500,
  };
}
