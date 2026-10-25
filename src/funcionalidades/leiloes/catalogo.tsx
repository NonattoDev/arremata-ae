"use client";
import { Icone } from "@/componentes/ui/icone";

import {
  Card,
  Typography,
  SearchField,
  Label,
  Input,
  Tabs,
} from "@heroui/react";
import { useState } from "react";

import type { Lote } from "@/tipos/leilao";
import { rotulosSituacao } from "@/lib/formatacao";
import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";
import { EstadoVazio } from "@/componentes/ui/estado-vazio";
import { CartaoLote } from "@/componentes/leiloes/cartao-lote";
export function CatalogoLeiloes() {
  const { dados: lotes, erro } = useRecurso<Lote[]>("lots", true);
  const [aba, definirAba] = useState("live"),
    [busca, definirBusca] = useState("");
  const visiveis =
    lotes?.filter(
      (loteBanco) =>
        loteBanco.status === aba &&
        `${loteBanco.item.title} ${loteBanco.item.artist}`
          .toLowerCase()
          .includes(busca.toLowerCase()),
    ) || [];
  return (
    <Card variant="transparent" className="gap-6 p-0">
      <Card.Header className="gap-2 py-3">
        <Typography.Heading level={1}>Leilões de arte</Typography.Heading>
        <Card.Description>
          Consulte os lotes, confira os valores e acompanhe os lances.
        </Card.Description>
      </Card.Header>
      <Card.Content id="leiloes" className="flex min-w-0 flex-col gap-6">
        <SearchField value={busca} onChange={definirBusca} className="max-w-xl">
          <Label className="flex items-center gap-2">
            <Icone nome="buscar" />
            Buscar obra ou artista
          </Label>
          <Input placeholder="Busque uma obra ou artista" />
        </SearchField>
        <Tabs
          selectedKey={aba}
          onSelectionChange={(chave) => definirAba(String(chave))}
        >
          <Tabs.ListContainer className="mb-4 w-full sm:w-fit">
            <Tabs.List
              aria-label="Status dos leilões"
              className="flex flex-nowrap"
            >
              {["live", "scheduled", "closed"].map((status) => (
                <Tabs.Tab
                  key={status}
                  id={status}
                  className="h-11 flex-1 whitespace-nowrap sm:w-auto sm:flex-none"
                >
                  {rotulosSituacao[status]} (
                  {lotes?.filter((loteBanco) => loteBanco.status === status)
                    .length || 0}
                  )
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
          {["live", "scheduled", "closed"].map((status) => (
            <Tabs.Panel
              key={status}
              id={status}
              className={`grid min-w-0 gap-6 md:grid-cols-2 ${visiveis.length > 2 ? "xl:grid-cols-3" : ""}`}
            >
              {erro && <Aviso>{erro}</Aviso>}
              {!lotes && !erro ? (
                <Carregando />
              ) : visiveis.length ? (
                visiveis.map((loteBanco) => (
                  <CartaoLote key={loteBanco.id} lote={loteBanco} />
                ))
              ) : (
                <EstadoVazio
                  title={
                    busca
                      ? "Nenhuma obra encontrada."
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
