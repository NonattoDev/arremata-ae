"use client";

import { useCallback, useContext } from "react";
import useSWR from "swr";
import { consultarApi } from "@/lib/api";
import { EscopoConsultas } from "@/componentes/provedores/escopo-consultas";

export function useRecurso<T>(
  endereco: string | null,
  atualizacaoPeriodica = false,
) {
  const identidade = useContext(EscopoConsultas);
  const {
    data: dados,
    error: erro,
    mutate: revalidar,
  } = useSWR<T, Error>(
    endereco ? [endereco, identidade] : null,
    ([endereco]: [string, string | null]) => consultarApi<T>(endereco),
    {
      refreshInterval: atualizacaoPeriodica ? 2000 : 0,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: true,
      keepPreviousData: false,
      errorRetryCount: 2,
    },
  );
  // A gravação continua no servidor. Só revalidamos a leitura depois que a Action confirma o resultado.
  const atualizar = useCallback(async () => {
    await revalidar();
  }, [revalidar]);
  return { dados: dados ?? null, erro: erro?.message || "", atualizar };
}
