"use client";

import { Card, Chip, Typography, Tabs } from "@heroui/react";
import { useState } from "react";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";
import type { Lote } from "@/tipos/leilao";
import { dataLocal } from "@/lib/datas";
import { useRecurso } from "@/hooks/use-recurso";
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
const normalizarBusca = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

export function CatalogoLeiloes() {
  const { dados: lotes, erro } = useRecurso<Lote[]>("lots", true);
  const [aba, definirAba] = useState("live");
  const [busca, definirBusca] = useState("");
  const [artista, definirArtista] = useState("");
  const [data, definirData] = useState("");
  const artistas = [
    ...new Set((lotes ?? []).map((lote) => lote.item.artist).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const datas = [
    ...new Set((lotes ?? []).map((lote) => lote.item.date).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  const [ordem, definirOrdem] = useState<OrdenacaoCatalogo>("prazo");
  const encontrados = (lotes ?? []).filter(
    (lote) =>
      (!artista || lote.item.artist === artista) &&
      (!data || lote.item.date === data) &&
      normalizarBusca(`${lote.item.title} ${lote.item.artist}`).includes(
        normalizarBusca(busca),
      ),
  );
  const visiveis = encontrados
    .filter((lote) => lote.status === aba)
    .sort((primeiro, segundo) => {
      if (ordem === "menor")
        return primeiro.currentAmount - segundo.currentAmount;
      if (ordem === "maior")
        return segundo.currentAmount - primeiro.currentAmount;
      if (ordem === "disputados") return segundo.bidCount - primeiro.bidCount;
      if (aba === "scheduled")
        return (
          dataLocal(primeiro.startsAt).valueOf() -
          dataLocal(segundo.startsAt).valueOf()
        );
      const diferenca =
        dataLocal(primeiro.endsAt).valueOf() -
        dataLocal(segundo.endsAt).valueOf();
      return aba === "closed" ? -diferenca : diferenca;
    });
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
      <Card.Content id="leiloes" className="flex min-w-0 flex-col gap-6 p-0">
        <FiltrosCatalogo
          artistas={artistas}
          datas={datas}
          artista={artista}
          data={data}
          aoArtista={definirArtista}
          aoData={definirData}
          aoLimpar={() => {
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
        <Tabs
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
                  className="min-h-12 min-w-0 flex-col gap-1 px-2 py-2 text-xs sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <Icone nome={icone} className="text-lg" />
                  <Chip.Label className="whitespace-nowrap">
                    {rotulo} ·{" "}
                    {encontrados.filter((lote) => lote.status === chave).length}
                  </Chip.Label>
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          <Typography className="mb-5 text-xs text-muted" aria-live="polite">
            {!lotes
              ? "Carregando catálogo…"
              : `${visiveis.length} ${visiveis.length === 1 ? "obra encontrada" : "obras encontradas"}${busca.trim() ? ` para “${busca.trim()}”` : ""}`}
          </Typography>
          {categorias.map(({ chave }) => (
            <Tabs.Panel key={chave} id={chave} className="min-w-0">
              {erro ? (
                <Aviso>{erro}</Aviso>
              ) : !lotes ? (
                <Carregando />
              ) : visiveis.length ? (
                <GradeProgressiva
                  key={JSON.stringify([aba, busca, artista, data, ordem])}
                  lotes={visiveis}
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
