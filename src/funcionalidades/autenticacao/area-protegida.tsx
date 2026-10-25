"use client";
import { useRouter } from "next/navigation";

import { useEffect, type ReactNode } from "react";

import type { Usuario } from "@/tipos/leilao";
import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";

export function AreaProtegida({
  autenticacao,
  children: filhos,
}: {
  autenticacao: ReturnType<typeof useRecurso<{ user: Usuario | null }>>;
  children: ReactNode;
}) {
  const roteador = useRouter();
  useEffect(() => {
    if (autenticacao.dados && !autenticacao.dados.user && !autenticacao.erro)
      roteador.replace("/entrar");
  }, [autenticacao.dados, autenticacao.erro, roteador]);
  if (autenticacao.erro) return <Aviso>{autenticacao.erro}</Aviso>;
  if (!autenticacao.dados) return <Carregando />;
  if (!autenticacao.dados.user) return <Carregando />;
  return filhos;
}
