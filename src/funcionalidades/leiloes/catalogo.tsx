"use client";

import { Card, Chip, Typography, Tabs, Accordion } from "@heroui/react";
import { useState } from "react";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";
import { useCatalogo } from "@/hooks/use-catalogo";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";
import { EstadoVazio } from "@/componentes/ui/estado-vazio";
import { GradeProgressiva } from "@/componentes/leiloes/grade-progressiva";
import { FiltrosCatalogo, type OrdenacaoCatalogo } from "./filtros-catalogo";

const categorias: { chave: string; rotulo: string; icone: NomeIcone }[] = [
  { chave: "live", rotulo: "Ao vivo", icone: "leilao" },
  { chave: "scheduled", rotulo: "Em breve", icone: "tempo" },
  { chave: "closed", rotulo: "Encerrados", icone: "confirmar" },
];
const coresCategorias: Record<string, { texto: string; destaque: string }> = {
  live: {
    texto: "text-emerald-700 dark:text-emerald-300",
    destaque: "bg-emerald-100 dark:bg-emerald-950",
  },
  scheduled: {
    texto: "text-blue-700 dark:text-blue-300",
    destaque: "bg-blue-100 dark:bg-blue-950",
  },
  closed: {
    texto: "text-violet-700 dark:text-violet-300",
    destaque: "bg-violet-100 dark:bg-violet-950",
  },
};
export function CatalogoLeiloes() {
  const [minimo, definirMinimo] = useState("");
  const [maximo, definirMaximo] = useState("");
  const [aba, definirAba] = useState("live");
  const [busca, definirBusca] = useState("");
  const [artista, definirArtista] = useState("");
  const [data, definirData] = useState("");
  const [ordem, definirOrdem] = useState<OrdenacaoCatalogo>("prazo");
  const {
    lotes,
    erro,
    total,
    totais,
    artistas,
    datas,
    teto,
    temMais,
    carregando,
    carregarMais,
  } = useCatalogo({ minimo, maximo, status: aba, busca, artista, data, ordem });
  const visiveis = lotes ?? [];
  const filtros = (
    <FiltrosCatalogo
      minimo={minimo}
      maximo={maximo}
      teto={teto}
      aoPreco={(menor, maior) => {
        definirMinimo(menor);
        definirMaximo(maior);
      }}
      artistas={artistas}
      datas={datas}
      artista={artista}
      data={data}
      aoArtista={definirArtista}
      aoData={definirData}
      aoLimpar={() => {
        definirMinimo("");
        definirMaximo("");
        definirBusca("");
        definirArtista("");
        definirData("");
        definirOrdem("prazo");
      }}
      busca={busca}
      aoBuscar={definirBusca}
      ordem={ordem}
      aoOrdenar={definirOrdem}
    />
  );
  return (
    <Card variant="transparent" className="gap-6 p-0">
      <Card.Header className="flex-row items-center gap-4 px-0 py-3">
        <Chip
          variant="soft"
          color="accent"
          className="h-12 w-12 shrink-0 justify-center rounded-2xl"
        >
          <Icone nome="mural" className="text-2xl" />
        </Chip>
        <Card.Content className="min-w-0 gap-1 p-0">
          <Typography.Heading
            level={1}
            className="text-2xl font-medium tracking-tight sm:text-3xl"
          >
            Explore os leilões
          </Typography.Heading>
          <Card.Description>
            Encontre uma obra e acompanhe a disputa.
          </Card.Description>
        </Card.Content>
      </Card.Header>
      <Card.Content
        id="leiloes"
        className="grid min-w-0 items-start gap-6 p-0 lg:grid-cols-[260px_minmax(0,1fr)]"
      >
        <Card.Content className="min-w-0 p-0">
          <Card.Content className="hidden p-0 lg:flex">{filtros}</Card.Content>
          <Accordion className="lg:hidden">
            <Accordion.Item id="filtros">
              <Accordion.Heading>
                <Accordion.Trigger>
                  Filtrar e ordenar
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>{filtros}</Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Card.Content>
        <Tabs
          className="min-w-0"
          selectedKey={aba}
          onSelectionChange={(chave) => definirAba(String(chave))}
        >
          <Tabs.ListContainer className="mb-3 w-full sm:w-fit">
            <Tabs.List
              aria-label="Status dos leilões"
              className="grid w-full grid-cols-3 sm:flex"
            >
              {categorias.map(({ chave, rotulo, icone }) => (
                <Tabs.Tab
                  key={chave}
                  id={chave}
                  className={`h-auto min-h-12 min-w-0 flex-col gap-1 px-2 py-2 text-xs sm:flex-row sm:gap-2 sm:px-4 sm:text-sm ${aba === chave ? `${coresCategorias[chave].destaque} shadow-sm` : ""}`}
                >
                  <Icone
                    nome={icone}
                    className={`text-lg ${coresCategorias[chave].texto}`}
                  />
                  <Chip.Label
                    className={`whitespace-nowrap ${coresCategorias[chave].texto}`}
                  >
                    {rotulo} · {totais[chave] ?? 0}
                  </Chip.Label>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          <Typography className="mb-5 text-xs text-muted" aria-live="polite">
            {!lotes
              ? "Carregando catálogo…"
              : `${total} ${total === 1 ? "obra encontrada" : "obras encontradas"}${busca.trim() ? ` para “${busca.trim()}”` : ""}`}
          </Typography>
          {categorias.map(({ chave }) => (
            <Tabs.Panel key={chave} id={chave} className="min-w-0">
              {erro ? (
                <Aviso>{erro}</Aviso>
              ) : !lotes ? (
                <Carregando />
              ) : visiveis.length ? (
                <GradeProgressiva
                  key={JSON.stringify([
                    aba,
                    busca,
                    artista,
                    data,
                    ordem,
                    minimo,
                    maximo,
                  ])}
                  lotes={visiveis}
                  total={total}
                  temMais={temMais}
                  carregando={carregando}
                  carregarMais={carregarMais}
                />
              ) : (
                <EstadoVazio
                  title={
                    busca
                      ? "Nenhuma obra encontrada. Tente outro nome ou artista."
                      : "Nenhum lote nesta categoria."
                  }
                />
              )}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Card.Content>
    </Card>
  );
}
