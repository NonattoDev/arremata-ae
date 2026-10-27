"use client";
import { formatarDataAcervo } from "@/lib/datas";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";
import { ImagemObra } from "@/componentes/leiloes/imagem-obra";
import {
  Card,
  Chip,
  Link,
  Separator,
  Typography,
  buttonVariants,
} from "@heroui/react";
import type { ItemCatalogo } from "@/servidor/leilao";
import { formatarReais, formatarDataHora } from "@/lib/formatacao";
import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";
import { Compartilhar } from "@/componentes/ui/compartilhar";
import { apelidoParticipante } from "@/lib/apelido-participante";

function DadoComprovante({
  icone,
  rotulo,
  valor,
}: {
  icone: NomeIcone;
  rotulo: string;
  valor: string;
}) {
  return (
    <Card.Content className="min-w-0 flex-row items-start gap-3 p-0">
      <Chip
        variant="soft"
        color="accent"
        className="mt-1 shrink-0"
        aria-hidden="true"
      >
        <Icone nome={icone} />
      </Chip>
      <Card.Content className="min-w-0 gap-1 p-0">
        <Card.Description className="text-xs">{rotulo}</Card.Description>
        <Typography className="break-words text-sm font-medium leading-relaxed">
          {valor}
        </Typography>
      </Card.Content>
    </Card.Content>
  );
}

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
    <Card variant="transparent" className="mx-auto w-full max-w-5xl gap-5 p-0">
      <Link
        href={`/lotes/${id}`}
        className="w-fit items-center gap-2 text-sm text-accent no-underline!"
      >
        <Icone nome="voltar" className="text-[18px]!" />
        Voltar ao leilão
      </Link>
      <Card className="gap-0 overflow-hidden rounded-3xl border border-border/60 p-0 shadow-sm">
        <Card.Header className="flex-row flex-wrap items-center justify-between gap-4 border-b border-border/60 px-5 py-6 sm:px-8">
          <Card.Content className="min-w-0 flex-row items-center gap-3 p-0">
            <Chip
              color="accent"
              variant="soft"
              className="h-11 w-11 justify-center rounded-2xl"
              aria-hidden="true"
            >
              <Icone nome="comprovante" />
            </Chip>
            <Card.Content className="min-w-0 gap-1 p-0">
              <Typography.Heading
                level={1}
                className="text-xl font-medium tracking-tight sm:text-2xl"
              >
                Comprovante de arremate
              </Typography.Heading>
              <Card.Description className="text-sm">
                Obra, valor e registro da transação.
              </Card.Description>
            </Card.Content>
          </Card.Content>
          <Chip color="success" variant="soft" className="gap-1.5">
            <Icone nome="confirmar" className="text-[16px]!" />
            Arremate concluído
          </Chip>
        </Card.Header>
        <Card.Content className="grid min-w-0 gap-0 p-0 md:grid-cols-2">
          <Card.Content className="min-w-0 gap-5 bg-[#faf8f4] p-5 sm:p-8 dark:bg-stone-900/50">
            <Card.Content className="flex h-64 items-center justify-center p-2 sm:h-80">
              <ImagemObra
                src={dados.item.image}
                alt={dados.item.title}
                preencher
                destaque
              />
            </Card.Content>
            <Card.Content className="gap-2 p-0">
              <Card.Description className="text-xs">
                {dados.item.artist} · {formatarDataAcervo(dados.item.date ?? "")}
              </Card.Description>
              <Typography.Heading
                level={2}
                className="font-[family-name:var(--fonte-arte)]! text-2xl font-normal leading-snug sm:text-3xl"
              >
                {dados.item.title}
              </Typography.Heading>
            </Card.Content>
          </Card.Content>
          <Card.Content className="min-w-0 gap-6 p-5 sm:p-8">
            <Card
              variant="transparent"
              className="gap-2 rounded-2xl bg-blue-50 p-5 dark:bg-blue-950/30"
            >
              <Card.Description className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <Icone nome="pagamento" className="text-[18px]!" />
                Valor do arremate
              </Card.Description>
              <Typography className="text-3xl font-semibold tracking-tight text-blue-800 tabular-nums dark:text-blue-200">
                {formatarReais(dados.amount)}
              </Typography>
            </Card>
            <DadoComprovante
              icone="pessoa"
              rotulo="Arrematante"
              valor={apelidoParticipante(dados.winner)}
            />
            <DadoComprovante
              icone="tempo"
              rotulo="Liquidado em"
              valor={formatarDataHora(dados.settledAt)}
            />
            <Separator />
            <Card.Content className="gap-2 p-0">
              <Card.Description className="text-xs">
                Identificação do lote
              </Card.Description>
              <Typography className="break-all font-mono text-xs leading-relaxed text-muted">
                {id}
              </Typography>
            </Card.Content>
            <Card.Content className="mt-auto flex-row flex-wrap items-center gap-3 p-0">
              <Link
                href={`/auditoria/${id}`}
                className={`${buttonVariants({ variant: "secondary", size: "sm" })} gap-2 no-underline!`}
              >
                <Icone nome="auditoria" className="text-[18px]!" />
                Verificar histórico
              </Link>
              <Compartilhar caminho={`/comprovante/${id}`} />
            </Card.Content>
          </Card.Content>
        </Card.Content>
        <Card.Footer className="flex-row items-start gap-2 border-t border-border/60 px-5 py-4 sm:px-8">
          <Icone nome="informacao" className="text-[16px]! text-muted" />
          <Typography className="text-xs leading-relaxed text-muted">
            Registro de arremate.
          </Typography>
        </Card.Footer>
      </Card>
    </Card>
  );
}
