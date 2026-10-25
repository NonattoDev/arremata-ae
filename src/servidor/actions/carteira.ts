"use server";

import { depositar } from "../comandos/mercado";
import { contextoAcao, resultadoAcao } from "./suporte";

export async function depositarAcao(entrada: unknown) {
  return resultadoAcao(async () => depositar(await contextoAcao(), entrada));
}
