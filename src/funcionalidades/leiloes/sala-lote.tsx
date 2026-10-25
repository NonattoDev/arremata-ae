"use client";
import {
  Card,
  Chip,
  Link,
  Separator,
  Typography,
  buttonVariants,
} from "@heroui/react";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
import { useRecurso } from "@/hooks/use-recurso";
import type { Sala } from "@/tipos/leilao";
import { formatarReais, rotulosSituacao } from "@/lib/formatacao";
import { DadosObra } from "@/componentes/leiloes/dados-obra";
import { ApresentacaoObra } from "@/componentes/leiloes/apresentacao-obra";
import { BotaoAcompanhar } from "@/componentes/leiloes/botao-acompanhar";
import { IndicadorAoVivo } from "@/componentes/leiloes/indicador-ao-vivo";
import { ContagemRegressiva } from "@/componentes/leiloes/contagem-regressiva";
import { HistoricoLances } from "@/componentes/leiloes/historico-lances";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";
import { FormularioLance } from "./formulario-lance";
import { AvisoNovoLance } from "@/componentes/leiloes/aviso-novo-lance";

export function SalaLote({ id }: { id: string }) {
  const usuario = useSessao().dados?.user;
  const recurso = useRecurso<Sala>(`lots/${id}`, true);
  const lote = recurso.dados;
  if (!lote)
    return (
      <Card>
        {recurso.erro ? <Aviso>{recurso.erro}</Aviso> : <Carregando />}
      </Card>
    );
  return (
    <Card variant="transparent" className="gap-8 p-0">
      <Card.Header className="flex-col items-start justify-between gap-4 rounded-3xl border border-orange-200/60 bg-[#f7f2e9] p-5 sm:flex-row sm:flex-wrap sm:items-end sm:p-6 dark:border-orange-900/50 dark:bg-stone-900">
        <Card.Content className="w-full min-w-0 gap-2 sm:w-auto">
          <Card.Description className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            <Icone nome="pessoa" />
            {lote.item.artist} · {lote.item.date}
          </Card.Description>
          <Typography.Heading
            level={1}
            className="max-w-3xl font-[family-name:var(--fonte-arte)]! text-4xl font-normal italic leading-tight text-[#993f26] sm:text-5xl dark:text-orange-300"
          >
            {lote.item.title}
          </Typography.Heading>
        </Card.Content>
        {["live", "scheduled"].includes(lote.status) && (
          <BotaoAcompanhar id={id} />
        )}
      </Card.Header>
      {recurso.erro && <Aviso>Atualização interrompida: {recurso.erro}</Aviso>}
      <Card.Content className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ApresentacaoObra lote={lote} />
        <Card className="min-w-0 gap-5 rounded-3xl border border-border/60 p-5 shadow-sm sm:p-7">
          <AvisoNovoLance key={id} lote={lote} />
          <Card.Header className="flex-row flex-wrap items-center justify-between gap-3 p-0">
            {lote.status === "live" ? (
              <IndicadorAoVivo forte />
            ) : (
              <Chip variant="soft">{rotulosSituacao[lote.status]}</Chip>
            )}
            <Card.Description>
              {lote.bidCount} {lote.bidCount === 1 ? "lance" : "lances"}
            </Card.Description>
          </Card.Header>
          <Card.Content className="gap-2 rounded-2xl bg-blue-50/60 p-5 sm:p-6 dark:bg-blue-950/20">
            <Card.Description>
              {lote.hasWinner
                ? "Arrematado por"
                : lote.bidCount
                  ? "Lance atual"
                  : "Lance inicial"}
            </Card.Description>
            <Typography className="text-2xl font-semibold tracking-tight text-blue-800 dark:text-blue-200 tabular-nums">
              {formatarReais(lote.currentAmount || lote.initial)}
            </Typography>
            <Typography className="text-xs text-muted">
              Incremento mínimo de {formatarReais(lote.increment)}
            </Typography>
          </Card.Content>
          <Card
            variant="secondary"
            className="flex-row flex-wrap items-center justify-between gap-3 rounded-2xl bg-orange-50 p-4 text-orange-950 dark:bg-orange-950/40 dark:text-orange-100"
          >
            <Card.Description className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Icone nome="tempo" />
              {lote.status === "scheduled"
                ? "Começa em"
                : lote.status === "live"
                  ? "Encerra em"
                  : "Disputa finalizada"}
            </Card.Description>
            {["live", "scheduled"].includes(lote.status) && (
              <ContagemRegressiva
                end={lote.status === "scheduled" ? lote.startsAt : lote.endsAt}
                serverTime={lote.serverTime}
              />
            )}
          </Card>
          {!lote.intact && (
            <Aviso>Histórico adulterado. Este lote está bloqueado.</Aviso>
          )}
          {usuario?.role === "bidder" && lote.position > 0 && (
            <Aviso
              sucesso={lote.isLeader}
              pulsar={!lote.isLeader && lote.status === "live"}
            >
              {lote.isLeader
                ? lote.status === "closed"
                  ? "Você arrematou esta obra!"
                  : "Você está ganhando!"
                : "Você foi superado."}{" "}
              Sua posição: {lote.position}º.
            </Aviso>
          )}
          {lote.status === "live" &&
            lote.intact &&
            (usuario?.role === "bidder" ? (
              <FormularioLance
                key={`${id}:${usuario.id}`}
                lote={lote}
                atualizar={recurso.atualizar}
                erroConsulta={recurso.erro}
              />
            ) : usuario ? (
              <Aviso>Leiloeiros não podem dar lances.</Aviso>
            ) : (
              <Link
                href="/entrar"
                className={buttonVariants({
                  variant: "primary",
                  className:
                    "min-h-12 w-full bg-[#a94328] text-white hover:bg-[#89351f]",
                })}
              >
                <Icone nome="entrar" />
                Entre para dar seu lance
              </Link>
            ))}
          {lote.hasWinner && (
            <Link href={`/comprovante/${id}`}>
              <Icone nome="comprovante" />
              Ver comprovante
            </Link>
          )}
          <Separator />
          <Card.Description className="flex items-start gap-2 text-sm leading-relaxed">
            <Icone nome="informacao" className="mt-0.5" />
            Lances nos últimos 2 minutos prorrogam o encerramento. O saldo fica
            reservado enquanto você lidera.
          </Card.Description>
          <Link
            href={`/auditoria/${id}`}
            className="text-sm text-emerald-800 dark:text-emerald-300"
          >
            <Icone nome="auditoria" />
            Verificar histórico do lote
          </Link>
        </Card>
      </Card.Content>
      <Card.Content className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <DadosObra lote={lote} />
        <Card className="min-w-0 gap-4 rounded-3xl border border-emerald-900/10 p-5 sm:p-6">
          <Card.Header className="gap-1 p-0">
            <Card.Title className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
              <Icone nome="historico" />
              Histórico de lances
            </Card.Title>
            <Card.Description>
              {recurso.erro
                ? "Atualização interrompida"
                : "Atualizando automaticamente…"}
            </Card.Description>
          </Card.Header>
          <HistoricoLances lances={lote.bids} />
        </Card>
      </Card.Content>
    </Card>
  );
}
