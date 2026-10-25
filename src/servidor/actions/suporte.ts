import { cookies } from "next/headers";
import { contextoComando } from "../comandos/contexto";
import { erroPublico } from "../erros";
import type { ResultadoAcao } from "@/tipos/acao";

export async function contextoAcao() {
  return contextoComando((await cookies()).get("arremata_session")?.value);
}
export async function resultadoAcao<T>(
  operation: () => Promise<T>,
): Promise<ResultadoAcao<T>> {
  try {
    return { success: true, data: await operation() };
  } catch (erro) {
    return { success: false, error: erroPublico(erro).error };
  }
}
