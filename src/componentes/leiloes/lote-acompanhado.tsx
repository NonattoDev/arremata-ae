"use client";
import { Button, Card, Chip, Link, Tooltip } from "@heroui/react";
import { useRecurso } from "@/hooks/use-recurso";
import type { Sala } from "@/tipos/leilao";
import { formatarReais, rotulosSituacao } from "@/lib/formatacao";
import { ContagemRegressiva } from "./contagem-regressiva";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { useAcompanhamento } from "@/componentes/provedores/provedor-acompanhamento";
import { LanceMiniplayer } from "./lance-miniplayer";
import { ImagemObra } from "./imagem-obra";

export function LoteAcompanhado({
  id,
  remover,
}: {
  id: string;
  remover: () => void;
}) {
  const { dados: lote, erro, atualizar } = useRecurso<Sala>(`lots/${id}`, true);
  const { silenciados, alternarSomLote, som } = useAcompanhamento();
  const silenciado = silenciados.includes(id);
  const descricaoSom = silenciado
    ? "Som deste leilão desligado"
    : som.ativo
      ? "Som deste leilão ligado"
      : "Som permitido neste leilão · som geral desligado";
  return (
    <Card variant="secondary" className="shrink-0 gap-3 p-3">
      <Card.Header className="flex-row items-start justify-between gap-2 p-0">
        {lote && (
          <Link
            href={`/lotes/${id}`}
            aria-label={`Abrir leilão: ${lote.item.title}`}
            className="flex h-16 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg"
          >
            <ImagemObra src={lote.item.image} alt="" preencher />
          </Link>
        )}
        <Card.Content className="min-w-0 gap-1">
          <Link
            href={`/lotes/${id}`}
            className="line-clamp-2 text-sm font-semibold"
          >
            {lote?.item.title ?? "Carregando lote…"}
          </Link>
          {lote && (
            <Card.Description className="text-xs">
              {lote.item.artist}
            </Card.Description>
          )}
        </Card.Content>
        <Card.Content className="flex-none flex-row items-center gap-1 p-0">
          <Tooltip delay={200}>
            <Button
              isIconOnly
              variant="ghost"
              size="sm"
              aria-label={`${silenciado ? "Permitir" : "Silenciar"} avisos de ${lote?.item.title ?? "este leilão"}. ${descricaoSom}`}
              aria-pressed={!silenciado}
              onPress={() => alternarSomLote(id)}
            >
              <Icone nome={silenciado || !som.ativo ? "semSom" : "som"} />
            </Button>
            <Tooltip.Content placement="top">{descricaoSom}</Tooltip.Content>
          </Tooltip>
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={`Remover ${lote?.item.title ?? "lote"} do miniplayer`}
            onPress={remover}
          >
            <Icone nome="fechar" />
          </Button>
        </Card.Content>
      </Card.Header>
      {erro && (
        <Aviso>
          Atualização interrompida.{" "}
          {lote ? "Os valores abaixo são da última consulta." : erro}
        </Aviso>
      )}
      {lote && (
        <>
          <Card.Content className="flex-row flex-wrap items-center justify-between gap-2">
            <Card.Title className="text-lg tabular-nums">
              {formatarReais(lote.currentAmount || lote.initial)}
            </Card.Title>
            <Chip
              size="sm"
              color={lote.status === "live" ? "success" : "default"}
              variant="soft"
            >
              {rotulosSituacao[lote.status]}
            </Chip>
          </Card.Content>
          <Card.Content className="flex-row flex-wrap items-center justify-between gap-2 text-xs">
            <Card.Description>
              {lote.bidCount} {lote.bidCount === 1 ? "lance" : "lances"}
            </Card.Description>
            {["live", "scheduled"].includes(lote.status) && (
              <ContagemRegressiva
                end={lote.status === "live" ? lote.endsAt : lote.startsAt}
                serverTime={lote.serverTime}
              />
            )}
          </Card.Content>
          {lote.position > 0 && (
            <Chip
              size="sm"
              color={lote.isLeader ? "success" : "warning"}
              variant="soft"
            >
              {lote.isLeader
                ? lote.status === "closed"
                  ? "Você arrematou"
                  : "Você lidera"
                : "Você foi superado"}{" "}
              · {lote.position}º
            </Chip>
          )}
          {!lote.intact && <Aviso>Histórico adulterado. Lote bloqueado.</Aviso>}
          <LanceMiniplayer
            lote={lote}
            atualizar={atualizar}
            erroConsulta={erro}
          />
        </>
      )}
    </Card>
  );
}
