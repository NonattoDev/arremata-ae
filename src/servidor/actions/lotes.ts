"use server";

import { criarLote, darLance, cancelarLote } from "../comandos/mercado";
import { contextoAcao, resultadoAcao } from "./suporte";

export async function criarLoteAcao(entrada: unknown) {
  return resultadoAcao(async () => criarLote(await contextoAcao(), entrada));
}
export async function darLanceAcao(idLote: string, entrada: unknown) {
  return resultadoAcao(async () =>
    darLance(await contextoAcao(), idLote, entrada),
  );
}
export async function cancelarLoteAcao(idLote: string) {
  return resultadoAcao(async () => cancelarLote(await contextoAcao(), idLote));
}
