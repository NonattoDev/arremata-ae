import dayjs from "dayjs";
import { validarCpf } from "./cpf";

export function validarNascimento(valor: string, agora = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
  const data = dayjs(valor);
  return (
    data.isValid() &&
    data.format("YYYY-MM-DD") === valor &&
    data.isBefore(dayjs(agora), "day")
  );
}

export function cadastroCompleto(
  usuario?: { cpf?: string | null; nascimento?: string | null } | null,
) {
  return (
    !!usuario?.cpf &&
    validarCpf(usuario.cpf) &&
    !!usuario.nascimento &&
    validarNascimento(usuario.nascimento)
  );
}
