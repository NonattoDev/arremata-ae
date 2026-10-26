"use client";

import { Button, Card, InputGroup, Label, SearchField } from "@heroui/react";
import { FiltroPreco } from "@/componentes/leiloes/filtro-preco";
import { Icone } from "@/componentes/ui/icone";

import { SeletorCatalogo } from "./seletor-catalogo";
export const ordenacoesCatalogo = {
  prazo: "Prazo mais próximo",
  menor: "Menor valor",
  maior: "Maior valor",
  disputados: "Mais disputados",
} as const;
export type OrdenacaoCatalogo = keyof typeof ordenacoesCatalogo;

export function FiltrosCatalogo({
  minimo,
  maximo,
  teto,
  aoPreco,
  busca,
  aoBuscar,
  ordem,
  aoOrdenar,
  artistas,
  datas,
  artista,
  data,
  aoArtista,
  aoData,
  aoLimpar,
}: {
  minimo: string;
  maximo: string;
  teto: number;
  aoPreco: (minimo: string, maximo: string) => void;
  artistas: string[];
  datas: string[];
  artista: string;
  data: string;
  aoArtista: (valor: string) => void;
  aoData: (valor: string) => void;
  aoLimpar: () => void;
  busca: string;
  aoBuscar: (valor: string) => void;
  ordem: OrdenacaoCatalogo;
  aoOrdenar: (valor: OrdenacaoCatalogo) => void;
}) {
  return (
    <Card className="gap-4 p-4 sm:p-5">
      <Card.Content className="grid min-w-0 gap-4 p-0 sm:items-end">
        <SearchField value={busca} onChange={aoBuscar} className="min-w-0">
          <Label>Buscar no catálogo</Label>
          <InputGroup fullWidth className="min-h-12">
            <InputGroup.Prefix>
              <Icone nome="buscar" />
            </InputGroup.Prefix>
            <InputGroup.Input placeholder="Nome da obra ou artista" />
            {busca && (
              <InputGroup.Suffix>
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label="Limpar busca"
                  onPress={() => aoBuscar("")}
                >
                  <Icone nome="fechar" />
                </Button>
              </InputGroup.Suffix>
            )}
          </InputGroup>
        </SearchField>
        <Card.Content className="grid min-w-0 gap-4 p-0 ">
          <SeletorCatalogo
            rotulo="Artista"
            icone="pessoa"
            valor={artista}
            aoSelecionar={aoArtista}
            opcoes={[
              { valor: "", rotulo: "Todos os artistas" },
              ...artistas.map((nome) => ({ valor: nome, rotulo: nome })),
            ]}
          />
          <SeletorCatalogo
            rotulo="Ano / período da obra"
            icone="tempo"
            valor={data}
            aoSelecionar={aoData}
            opcoes={[
              { valor: "", rotulo: "Todas as datas" },
              ...datas.map((ano) => ({ valor: ano, rotulo: ano })),
            ]}
          />
          <SeletorCatalogo
            rotulo="Ordenar"
            icone="historico"
            valor={ordem}
            aoSelecionar={(valor) => aoOrdenar(valor as OrdenacaoCatalogo)}
            opcoes={Object.entries(ordenacoesCatalogo).map(
              ([valor, rotulo]) => ({ valor, rotulo }),
            )}
          />
        </Card.Content>
        <FiltroPreco
          minimo={minimo}
          maximo={maximo}
          teto={teto}
          aoAlterar={aoPreco}
        />
        {(busca ||
          artista ||
          data ||
          minimo ||
          maximo ||
          ordem !== "prazo") && (
          <Button
            variant="ghost"
            size="sm"
            className="w-fit gap-2"
            onPress={aoLimpar}
          >
            <Icone nome="fechar" />
            Limpar filtros
          </Button>
        )}
      </Card.Content>
    </Card>
  );
}
