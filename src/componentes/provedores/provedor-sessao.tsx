"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRecurso } from "@/hooks/use-recurso";
import type { Usuario } from "@/tipos/leilao";
import { RouterProvider, I18nProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { EscopoConsultas } from "./escopo-consultas";

type EstadoSessao = ReturnType<typeof useRecurso<{ user: Usuario | null }>>;
const ContextoSessao = createContext<EstadoSessao | null>(null);

export function ProvedorSessao({ children: filhos }: { children: ReactNode }) {
  const roteador = useRouter();
  const sessao = useRecurso<{ user: Usuario | null }>("me");
  return (
    <ContextoSessao.Provider value={sessao}>
      <I18nProvider locale="pt-BR">
        <RouterProvider navigate={roteador.push}>
          <EscopoConsultas.Provider value={sessao.dados?.user?.id ?? null}>
            {filhos}
          </EscopoConsultas.Provider>
        </RouterProvider>
      </I18nProvider>
    </ContextoSessao.Provider>
  );
}
export function useSessao() {
  const sessao = useContext(ContextoSessao);
  if (!sessao)
    throw new Error("useSessao precisa estar dentro de ProvedorSessao");
  return sessao;
}
