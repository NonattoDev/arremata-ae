"use client";
import { Icone } from "@/componentes/ui/icone";
import { ImagemObra } from "@/componentes/leiloes/imagem-obra";
import { Card, Link, Typography } from "@heroui/react";

import type { ItemCatalogo } from "@/servidor/leilao";

import { formatarReais } from "@/lib/formatacao";
import { formatarDataHora } from "@/lib/formatacao";
import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";
import { Compartilhar } from "@/componentes/ui/compartilhar";
export function Comprovante({ id }: { id: string }) {
  const { dados, erro } = useRecurso<{
    item: ItemCatalogo;
    winner: string;
    amount: number;
    settledAt: string;
    checkpoint: string;
  }>(`receipts/${id}`);
  if (!dados)
    return <Card>{erro ? <Aviso>{erro}</Aviso> : <Carregando />}</Card>;
  return (
    <Card className="mx-auto w-full max-w-2xl gap-6 p-5 sm:p-8">
      <Link href={`/lotes/${id}`}>
        <Icone nome="voltar" />
        Voltar ao lote
      </Link>
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Typography.Heading level={1}>
          Comprovante de arremate
        </Typography.Heading>
        <ImagemObra src={dados.item.image} alt={dados.item.title} />
        <Card.Title>{dados.item.title}</Card.Title>
        <Typography.Paragraph>{dados.item.artist}</Typography.Paragraph>
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Typography>Arrematante</Typography>
            <Typography>{dados.winner}</Typography>
          </Card.Content>
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Typography>Valor</Typography>
            <Typography>{formatarReais(dados.amount)}</Typography>
          </Card.Content>
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Typography>Liquidado em</Typography>
            <Typography>{formatarDataHora(dados.settledAt)}</Typography>
          </Card.Content>
        </Card.Content>
        <Compartilhar caminho={`/comprovante/${id}`} />
        <Link href={`/auditoria/${id}`}>
          <Icone nome="auditoria" />
          Verificar histórico
        </Link>
        <Typography.Paragraph>
          Registro de arremate com saldo simulado.
        </Typography.Paragraph>
      </Card.Content>
    </Card>
  );
}
