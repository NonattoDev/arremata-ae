"use client";
import { ArtworkImage } from "@/components/auctions/artwork-image";
import { Card, Link, Typography } from "@heroui/react";

import type { Item } from "@/server/auction";

import { brl } from "@/lib/format";
import { date } from "@/lib/format";
import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { Share } from "@/components/ui/share";
export function Receipt({ id }: { id: string }) {
  const { data, error } = useResource<{
    item: Item;
    winner: string;
    amount: number;
    settledAt: string;
    checkpoint: string;
  }>(`receipts/${id}`);
  if (!data)
    return <Card>{error ? <Notice>{error}</Notice> : <Loading />}</Card>;
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <Link href={`/lotes/${id}`}>Voltar ao lote</Link>
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Typography>COMPROVANTE DE ARREMATE</Typography>
        <Typography.Heading level={1}>
          Uma nova história foi arrematada.
        </Typography.Heading>
        <ArtworkImage src={data.item.image} alt={data.item.title} />
        <Card.Title>{data.item.title}</Card.Title>
        <Typography.Paragraph>{data.item.artist}</Typography.Paragraph>
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Typography>Arrematante</Typography>
            <Typography>{data.winner}</Typography>
          </Card.Content>
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Typography>Valor</Typography>
            <Typography>{brl(data.amount)}</Typography>
          </Card.Content>
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Typography>Liquidado em</Typography>
            <Typography>{date(data.settledAt)}</Typography>
          </Card.Content>
        </Card.Content>
        <Share path={`/comprovante/${id}`} />
        <Link href={`/auditoria/${id}`}>Verificar histórico</Link>
        <Typography.Paragraph>
          Comprovante demonstrativo. Não representa venda de obra física nem
          transação com dinheiro real.
        </Typography.Paragraph>
      </Card.Content>
    </Card>
  );
}
