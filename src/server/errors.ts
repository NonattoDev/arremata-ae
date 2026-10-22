import { ZodError } from "zod";
import { DomainError } from "./auction";

export function publicError(error: unknown) {
  if (error instanceof DomainError)
    return { error: error.message, status: error.status };
  if (error instanceof ZodError)
    return {
      error:
        "Confira os campos: valores válidos, e-mail e senha com pelo menos 12 caracteres.",
      status: 400,
    };
  if (error instanceof SyntaxError)
    return { error: "Requisição inválida.", status: 400 };
  const code = (error as { code?: string; meta?: { code?: string } })?.code;
  const sqlCode = (error as { meta?: { code?: string } })?.meta?.code;
  if (code === "23505" || code === "P2002" || sqlCode === "23505")
    return { error: "Este cadastro já existe.", status: 409 };
  console.error(
    "Operation failed",
    error instanceof Error ? error.message : "unknown",
  );
  return {
    error: "Não foi possível concluir. Tente novamente em instantes.",
    status: 500,
  };
}
