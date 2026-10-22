"use client";
import { Table } from "@heroui/react";
import type { Bid } from "@/types/auction";
import { brl, date } from "@/lib/format";
import { Empty } from "@/components/ui/empty";
export function BidTable({ bids }: { bids: Bid[] }) {
  if (!bids.length)
    return (
      <Empty title="Nenhum lance registrado.">
        Os lances aceitos aparecerão nesta lista.
      </Empty>
    );
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Histórico de lances">
          <Table.Header>
            <Table.Column isRowHeader>Lance</Table.Column>
            <Table.Column>Participante</Table.Column>
            <Table.Column>Valor</Table.Column>
            <Table.Column>Data e hora</Table.Column>
          </Table.Header>
          <Table.Body>
            {[...bids].reverse().map((b) => (
              <Table.Row key={b.sequence} id={String(b.sequence)}>
                <Table.Cell>#{String(b.sequence).padStart(3, "0")}</Table.Cell>
                <Table.Cell>{b.alias}</Table.Cell>
                <Table.Cell>{brl(b.amount)}</Table.Cell>
                <Table.Cell>{date(b.placedAt)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
