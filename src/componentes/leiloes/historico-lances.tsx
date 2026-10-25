"use client";
import { Table } from "@heroui/react";
import type { Lance } from "@/tipos/leilao";
import { formatarReais, formatarDataHora } from "@/lib/formatacao";
import { EstadoVazio } from "@/componentes/ui/estado-vazio";
import { apelidoParticipante } from "@/lib/apelido-participante";
export function HistoricoLances({ lances }: { lances: Lance[] }) {
  if (!lances.length)
    return (
      <EstadoVazio title="Nenhum lance registrado.">
        Os lances aceitos aparecerão nesta lista.
      </EstadoVazio>
    );
  return (
    <Table>
      <Table.ScrollContainer
        tabIndex={0}
        aria-label="Role para consultar todas as colunas dos lances"
      >
        <Table.Content aria-label="Histórico de lances">
          <Table.Header>
            <Table.Column isRowHeader>Lance</Table.Column>
            <Table.Column>Participante (apelido)</Table.Column>
            <Table.Column>Valor</Table.Column>
            <Table.Column>Data e hora</Table.Column>
          </Table.Header>
          <Table.Body>
            {[...lances].reverse().map((lanceBanco) => (
              <Table.Row
                key={lanceBanco.sequence}
                id={String(lanceBanco.sequence)}
              >
                <Table.Cell>
                  #{String(lanceBanco.sequence).padStart(3, "0")}
                </Table.Cell>
                <Table.Cell>{apelidoParticipante(lanceBanco.alias)}</Table.Cell>
                <Table.Cell>{formatarReais(lanceBanco.amount)}</Table.Cell>
                <Table.Cell>{formatarDataHora(lanceBanco.placedAt)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
