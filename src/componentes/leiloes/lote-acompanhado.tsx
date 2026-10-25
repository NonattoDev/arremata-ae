"use client";
import { Button, Card, Chip, Link } from "@heroui/react";
import { useRecurso } from "@/hooks/use-recurso";
import type { Sala } from "@/tipos/leilao";
import { formatarReais, rotulosSituacao } from "@/lib/formatacao";
import { ContagemRegressiva } from "./contagem-regressiva";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { useAcompanhamento } from "@/componentes/provedores/provedor-acompanhamento";

export function LoteAcompanhado({
  id,
  remover,
}: {
  id: string;
  remover: () => void;
}) {
  const { dados: lote, erro } = useRecurso<Sala>(`lots/${id}`, true);
  const { silenciados, alternarSomLote, som } = useAcompanhamento();
  const silenciado = silenciados.includes(id);
  return (
    <Card variant="secondary" className="shrink-0 gap-3 p-3">
      <Card.Header className="flex-row items-start justify-between gap-2 p-0">
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
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={`Remover ${lote?.item.title ?? "lote"} do miniplayer`}
          onPress={remover}
        >
          <Icone nome="fechar" />
        </Button>
      </Card.Header>
      {erro && (
        <Aviso>
          Atualização interrompida.{" "}
          {lote ? "Os valores abaixo são da última consulta." : erro}
        </Aviso>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-auto min-h-11 justify-start whitespace-normal text-left text-xs"
        aria-label={`${silenciado ? "Permitir" : "Silenciar"} avisos de ${lote?.item.title ?? "este leilão"}`}
        aria-pressed={!silenciado}
        onPress={() => alternarSomLote(id)}
      >
        <Icone nome={silenciado ? "semSom" : "som"} />
        {silenciado
          ? "Este leilão está mudo"
          : som.ativo
            ? "Som deste leilão ligado"
            : "Permitido · som geral desligado"}
      </Button>
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
        </>
      )}
    </Card>
  );
}
