"use server";
import { iniciarDeposito, processarDeposito } from "../comandos/depositos";
import { contextoAcao, resultadoAcao } from "./suporte";
import { listarComprovantesDeposito } from "../comandos/comprovantes-deposito";
export async function listarComprovantesDepositoAcao(pagina: number = 1) {
  return resultadoAcao(async () =>
    listarComprovantesDeposito(await contextoAcao(), pagina),
  );
}
export async function iniciarDepositoAcao(entrada: unknown) {
  return resultadoAcao(async () =>
    iniciarDeposito(await contextoAcao(), entrada),
  );
}
export async function acompanharDepositoAcao(id: unknown) {
  return resultadoAcao(async () =>
    processarDeposito(await contextoAcao(), id, "acompanhar"),
  );
}
export async function cancelarDepositoAcao(id: unknown) {
  return resultadoAcao(async () =>
    processarDeposito(await contextoAcao(), id, "cancelar"),
  );
}
export async function confirmarQrAcao(id: unknown) {
  return resultadoAcao(async () => {
    const resultado = await processarDeposito(await contextoAcao(), id, "qr");
    return { estado: resultado.estado, valor: resultado.valor };
  });
}
