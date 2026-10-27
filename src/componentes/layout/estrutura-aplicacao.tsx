"use client";
import { executarAcao } from "@/lib/executar-acao";
import { sairAcao } from "@/servidor/actions/autenticacao";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { Card, Surface } from "@heroui/react";

import type { ReactNode } from "react";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
import { CaminhoPagina } from "@/componentes/layout/caminho-pagina";
import { BarraNavegacao } from "@/componentes/layout/barra-navegacao";
import { PainelAcompanhamento } from "@/componentes/leiloes/painel-acompanhamento";
import { Marca } from "./marca";
import { TransicaoPagina } from "./transicao-pagina";
export function EstruturaAplicacao({
  children: filhos,
}: {
  children: ReactNode;
}) {
  const caminho = usePathname(),
    roteador = useRouter();
  const autenticacao = useSessao();
  const usuario = autenticacao.dados?.user || null;
  const [escuro, definirEscuro] = useState(false);
  useEffect(() => {
    const valor = localStorage.getItem("theme") === "dark";
    definirEscuro(valor);
    document.documentElement.classList.toggle("dark", valor);
  }, []);
  useEffect(() => {
    void autenticacao.atualizar();
  }, [caminho]); // Revalidamos a sessão do cookie após navegar.
  const sair = async () => {
    await executarAcao(() => sairAcao());
    await autenticacao.atualizar();
    roteador.push("/");
  };
  const alternarTema = () => {
    definirEscuro(!escuro);
    document.documentElement.classList.toggle("dark", !escuro);
    localStorage.setItem("theme", escuro ? "light" : "dark");
  };
  const paginaAcesso = caminho === "/entrar" || caminho === "/cadastro";
  if (paginaAcesso)
    return (
      <Surface
        variant="secondary"
        className="flex min-h-dvh items-center justify-center px-4 py-10"
      >
        <Card
          variant="transparent"
          role="main"
          className="w-full max-w-lg gap-8 p-0"
        >
          <Card.Header className="items-center">
            <Marca vertical />
          </Card.Header>
          <TransicaoPagina>{filhos}</TransicaoPagina>
        </Card>
      </Surface>
    );
  return (
    <Surface variant="secondary" className="min-h-screen overflow-x-clip py-1">
      <BarraNavegacao
        usuario={usuario}
        escuro={escuro}
        aoAlternarTema={alternarTema}
        aoSair={sair}
      />
      <Card
        variant="transparent"
        role="main"
        className="mx-auto my-6 w-[calc(100%-1.5rem)] max-w-[1600px] min-w-0 p-0 pb-24 sm:my-8 sm:w-[calc(100%-3rem)]"
      >
        <Card.Content className="min-w-0">
          {(usuario ||
            !["/meus-lotes", "/carteira", "/novo-lote"].includes(caminho)) && (
            <CaminhoPagina />
          )}
          <TransicaoPagina>{filhos}</TransicaoPagina>
        </Card.Content>
      </Card>
      <PainelAcompanhamento />
    </Surface>
  );
}
