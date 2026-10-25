"use client";
import { Icone } from "@/componentes/ui/icone";

import type { Lance } from "@/tipos/leilao";
import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";
import { HistoricoLances } from "@/componentes/leiloes/historico-lances";
import { Compartilhar } from "@/componentes/ui/compartilhar";
import { Card, Label, Link, Typography } from "@heroui/react";
export function PaginaAuditoria({ id }: { id: string }) {
  const { dados, erro } = useRecurso<{
    title: string;
    intact: boolean;
    bids: Lance[];
    checkpoint: string;
  }>(`audit/${id}`, true);
  if (!dados)
    return <Card>{erro ? <Aviso>{erro}</Aviso> : <Carregando />}</Card>;
  return (
    <Card className="min-w-0 gap-6 p-5 sm:p-8">
      <Link href={`/lotes/${id}`}>
        <Icone nome="voltar" />
        Voltar ao lote
      </Link>
      <Typography>CONSULTA PÚBLICA</Typography>
      <Typography.Heading level={1}>Auditoria do lote</Typography.Heading>
      <Typography.Paragraph>{dados.title}</Typography.Paragraph>
      {erro && <Aviso>{erro}</Aviso>}
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Card.Title>
            {dados.intact ? "Histórico íntegro" : "Adulteração detectada"}
          </Card.Title>
          <Typography.Paragraph>
            {dados.intact
              ? "Os lances e o checkpoint correspondem aos registros autenticados pelo servidor."
              : "Há registros alterados, inseridos ou removidos. As operações deste lote estão bloqueadas."}
          </Typography.Paragraph>
        </Card.Content>
        <Compartilhar caminho={`/auditoria/${id}`} />
      </Card.Content>
      <HistoricoLances lances={dados.bids} />
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
        <Typography.Code className="block max-w-full break-all whitespace-normal">
          {dados.checkpoint}
        </Typography.Code>
      </Card.Content>
    </Card>
  );
}
