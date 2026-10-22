"use client";

import type { Bid } from "@/types/auction";
import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { BidTable } from "@/components/auctions/bid-table";
import { Share } from "@/components/ui/share";
import { Card, Label, Link, Typography } from "@heroui/react";
export function Audit({ id }: { id: string }) {
  const { data, error } = useResource<{
    title: string;
    intact: boolean;
    bids: Bid[];
    checkpoint: string;
  }>(`audit/${id}`, true);
  if (!data)
    return <Card>{error ? <Notice>{error}</Notice> : <Loading />}</Card>;
  return (
    <Card>
      <Link href={`/lotes/${id}`}>Voltar ao lote</Link>
      <Typography>CONSULTA PÚBLICA</Typography>
      <Typography.Heading level={1}>Auditoria do lote</Typography.Heading>
      <Typography.Paragraph>{data.title}</Typography.Paragraph>
      {error && <Notice>{error}</Notice>}
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Card.Title>
            {data.intact ? "Histórico íntegro" : "Adulteração detectada"}
          </Card.Title>
          <Typography.Paragraph>
            {data.intact
              ? "Os lances e o checkpoint correspondem aos registros autenticados pelo servidor."
              : "Há registros alterados, inseridos ou removidos. As operações deste lote estão bloqueadas."}
          </Typography.Paragraph>
        </Card.Content>
        <Share path={`/auditoria/${id}`} />
      </Card.Content>
      <BidTable bids={data.bids} />
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Card.Title>Como verificamos?</Card.Title>
        <Typography.Paragraph>
          Cada lance tem uma assinatura HMAC que inclui o lance anterior. Um
          checkpoint autenticado registra a quantidade e o último lance,
          permitindo detectar também a remoção do final do histórico. A chave
          fica fora do banco de dados.
        </Typography.Paragraph>
        <Typography.Paragraph>
          Os participantes aparecem com identificadores públicos, sem nomes ou
          e-mails. Esta verificação é feita pelo servidor; não é uma
          certificação externa nem protege contra comprometimento da chave ou
          restauração integral de um snapshot válido.
        </Typography.Paragraph>
        <Label>Checkpoint atual</Label>
        <Typography.Code>{data.checkpoint}</Typography.Code>
      </Card.Content>
    </Card>
  );
}
