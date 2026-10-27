"use client";
import { useCallback, useContext } from "react";
import useSWRInfinite from "swr/infinite";
import { consultarApi } from "@/lib/api";
import { EscopoConsultas } from "@/componentes/provedores/escopo-consultas";
import type { Lote } from "@/tipos/leilao";
type PaginaCatalogo = {
  lotes: Lote[];
  total: number;
  totais: Record<string, number>;
  temMais: boolean;
  artistas: string[];
  datas: string[];
  teto: number;
};
export function useCatalogo(filtros: Record<string, string>) {
  const identidade = useContext(EscopoConsultas);
  const parametros = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor !== ""),
  ).toString();
  const { data, error, size, setSize, isValidating } = useSWRInfinite<
    PaginaCatalogo,
    Error
  >(
    (indice, anterior: PaginaCatalogo | null) =>
      anterior && !anterior.temMais
        ? null
        : [`auction-catalog?${parametros}&pagina=${indice + 1}`, identidade],
    ([endereco]: [string, string | null]) =>
      consultarApi<PaginaCatalogo>(endereco),
    {
      refreshInterval: 5000,
      refreshWhenHidden: false,
      errorRetryCount: 2,
      persistSize: false,
    },
  );
  const carregando = isValidating || !!(data && size > data.length);
  const carregarMais = useCallback(() => {
    if (!carregando) void setSize((atual) => atual + 1);
  }, [carregando, setSize]);
  const lotes = data
    ? [
        ...new Map(
          data.flatMap((pagina) => pagina.lotes).map((lote) => [lote.id, lote]),
        ).values(),
      ]
    : null;
  return {
    lotes,
    erro: error?.message ?? "",
    total: data?.[0]?.total ?? 0,
    totais: data?.[0]?.totais ?? {},
    artistas: data?.[0]?.artistas ?? [],
    datas: data?.[0]?.datas ?? [],
    teto: data?.[0]?.teto ?? 100,
    temMais: data?.at(-1)?.temMais ?? false,
    carregando,
    carregarMais,
  };
}
