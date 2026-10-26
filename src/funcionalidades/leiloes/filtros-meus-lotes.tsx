"use client";

import { Button, Card, InputGroup, Label, SearchField } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import { SeletorCatalogo } from "./seletor-catalogo";
import type { Lote } from "@/tipos/leilao";

export const filtrosIniciais = {
  busca: "",
  status: "todos",
  resultado: "todos",
  ordem: "recentes",
};
export type FiltrosParticipacoes = typeof filtrosIniciais;
const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

export function filtrarParticipacoes(
  lotes: Lote[],
  filtros: FiltrosParticipacoes,
) {
  const busca = normalizar(filtros.busca);
  return lotes
    .filter((lote) => {
      if (
        busca &&
        !normalizar(`${lote.item.title} ${lote.item.artist}`).includes(busca)
      )
        return false;
      if (filtros.status !== "todos" && lote.status !== filtros.status)
        return false;
      if (filtros.resultado === "ganhando")
        return lote.status === "live" && lote.isLeader;
      if (filtros.resultado === "superado")
        return lote.status === "live" && !lote.isLeader;
      if (filtros.resultado === "arrematados")
        return lote.status === "closed" && lote.hasWinner && lote.isLeader;
      if (filtros.resultado === "nao-arrematados")
        return lote.status === "closed" && !(lote.hasWinner && lote.isLeader);
      return true;
    })
    .sort((a, b) => {
      if (filtros.ordem === "menor")
        return (a.currentAmount || a.initial) - (b.currentAmount || b.initial);
      if (filtros.ordem === "maior")
        return (b.currentAmount || b.initial) - (a.currentAmount || a.initial);
      if (filtros.ordem === "prazo")
        return (
          Date.parse(a.status === "scheduled" ? a.startsAt : a.endsAt) -
          Date.parse(b.status === "scheduled" ? b.startsAt : b.endsAt)
        );
      return Date.parse(b.startsAt) - Date.parse(a.startsAt);
    });
}

export function FiltrosMeusLotes({
  filtros,
  aoMudar,
  leiloeiro,
}: {
  filtros: FiltrosParticipacoes;
  aoMudar: (valor: FiltrosParticipacoes) => void;
  leiloeiro: boolean;
}) {
  const alterar = (campo: keyof FiltrosParticipacoes, valor: string) =>
    aoMudar({ ...filtros, [campo]: valor });
  const ativos = Object.keys(filtrosIniciais).some(
    (campo) =>
      filtros[campo as keyof FiltrosParticipacoes] !==
      filtrosIniciais[campo as keyof FiltrosParticipacoes],
  );
  return (
    <Card variant="secondary" className="min-w-0 gap-4 p-4">
      <SearchField
        value={filtros.busca}
        onChange={(valor) => alterar("busca", valor)}
      >
        <Label className="flex items-center gap-2">
          <Icone nome="buscar" className="text-[16px]! text-accent" />
          Buscar leilões
        </Label>
        <InputGroup fullWidth>
          <InputGroup.Prefix>
            <Icone nome="buscar" />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="Nome da obra ou artista" />
        </InputGroup>
      </SearchField>
      <Card.Content
        className={`grid min-w-0 gap-3 p-0 ${leiloeiro ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
      >
        <SeletorCatalogo
          rotulo="Status"
          icone="leilao"
          valor={filtros.status}
          aoSelecionar={(valor) => alterar("status", valor)}
          opcoes={[
            { valor: "todos", rotulo: "Todos os status" },
            { valor: "live", rotulo: "Ao vivo" },
            { valor: "scheduled", rotulo: "Em breve" },
            { valor: "closed", rotulo: "Encerrados" },
            { valor: "cancelled", rotulo: "Cancelados" },
          ]}
        />
        {!leiloeiro && (
          <SeletorCatalogo
            rotulo="Minha participação"
            icone="pessoa"
            valor={filtros.resultado}
            aoSelecionar={(valor) => alterar("resultado", valor)}
            opcoes={[
              { valor: "todos", rotulo: "Todas" },
              { valor: "ganhando", rotulo: "Estou ganhando" },
              { valor: "superado", rotulo: "Fui superado" },
              { valor: "arrematados", rotulo: "Arrematei" },
              { valor: "nao-arrematados", rotulo: "Não arrematei" },
            ]}
          />
        )}
        <SeletorCatalogo
          rotulo="Ordenar"
          icone="historico"
          valor={filtros.ordem}
          aoSelecionar={(valor) => alterar("ordem", valor)}
          opcoes={[
            { valor: "recentes", rotulo: "Início mais recente" },
            { valor: "prazo", rotulo: "Data de término / início" },
            { valor: "menor", rotulo: "Menor valor" },
            { valor: "maior", rotulo: "Maior valor" },
          ]}
        />
      </Card.Content>
      {ativos && (
        <Button
          size="sm"
          variant="ghost"
          className="w-fit gap-2"
          onPress={() => aoMudar(filtrosIniciais)}
        >
          <Icone nome="fechar" />
          Limpar filtros
        </Button>
      )}
    </Card>
  );
}
