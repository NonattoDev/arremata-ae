"use client";

import { startTransition } from "react";
import type { ResultadoAcao } from "@/tipos/acao";

/** A transição mantém o estado da Action; falhas esperadas chegam ao formulário. */
export function executarAcao<T>(
  action: () => Promise<ResultadoAcao<T>>,
): Promise<T> {
  return new Promise((resolver, rejeitar) => {
    startTransition(async () => {
      try {
        const resultado = await action();
        if (!resultado.success) throw new Error(resultado.error);
        resolver(resultado.data);
      } catch (erro) {
        rejeitar(erro);
      }
    });
  });
}
