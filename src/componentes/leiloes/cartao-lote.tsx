"use client";
import { formatarDataAcervo } from "@/lib/datas";

import {
  Card,
  Chip,
  Link,
  Separator,
  Typography,
  buttonVariants,
} from "@heroui/react";
import { GaleriaObra } from "./galeria-obra";
import { BotaoAcompanhar } from "./botao-acompanhar";
import { Icone } from "@/componentes/ui/icone";
import { PrazoLote } from "./prazo-lote";
import { IndicadorAoVivo } from "./indicador-ao-vivo";
import { historiasObras } from "@/lib/historias-obras";
import type { Lote } from "@/tipos/leilao";
import { formatarReais, rotulosSituacao } from "@/lib/formatacao";
import type { ReactNode } from "react";

export function CartaoLote({
  lote,
  children,
}: {
  lote: Lote;
  children?: ReactNode;
}) {
  const endereco = `/lotes/${lote.id}`;
  const encerrado = lote.status === "closed";
  const rotuloValor = encerrado
    ? lote.hasWinner
      ? "Arrematado por"
      : "Lance inicial"
    : lote.bidCount
      ? "Lance atual"
      : "Lance inicial";

  return (
    <Card className="h-full min-w-0 gap-0 overflow-hidden border border-border/60 p-0 shadow-sm">
      <Card.Content className="relative">
        <GaleriaObra lote={lote} className="h-72! p-5 pt-12" />
        {lote.status === "live" ? (
          <Card.Content className="pointer-events-none absolute left-4 top-4 p-0">
            <IndicadorAoVivo rotulo="Ao vivo" forte />
          </Card.Content>
        ) : (
          <Chip
            color={
              lote.status === "live"
                ? "success"
                : lote.status === "scheduled"
                  ? "accent"
                  : "default"
            }
            variant="primary"
            size="sm"
            className="pointer-events-none absolute left-4 top-4 h-7 gap-1.5 px-2.5 py-1"
          >
            <Icone
              className="text-[14px]! leading-none"
              nome={
                lote.status === "scheduled"
                  ? "tempo"
                  : lote.status === "cancelled"
                    ? "cancelar"
                    : "confirmar"
              }
            />
            <Chip.Label className="leading-none">{rotulosSituacao[lote.status]}</Chip.Label>
          </Chip>
        )}
      </Card.Content>
      <Card.Header className="gap-1 px-5 pb-4 pt-5">
        <Card.Description>
          {lote.item.artist} · {formatarDataAcervo(lote.item.date ?? "")}
        </Card.Description>
        <Card.Title className="min-h-14 text-lg font-semibold leading-7">
          <Link
            href={endereco}
            className="line-clamp-2"
            aria-label={lote.item.title}
          >
            {lote.item.title}
          </Link>
        </Card.Title>
        {historiasObras[lote.item.externalId] && (
          <Card.Description className="line-clamp-2 min-h-10 text-sm leading-5">
            {historiasObras[lote.item.externalId].contexto}
          </Card.Description>
        )}
      </Card.Header>
      <Card.Content className="gap-4 px-5 pb-5">
        <Separator />
        <Card.Content className="flex-row flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <Card.Content className="flex-none gap-1">
            <Card.Description>{rotuloValor}</Card.Description>
            <Typography className="font-[family-name:var(--fonte-texto)]! text-xl font-semibold tracking-normal tabular-nums text-blue-800 dark:text-blue-300">
              {formatarReais(lote.currentAmount || lote.initial)}
            </Typography>
          </Card.Content>
          <Card.Description>
            {lote.bidCount === 0
              ? "Sem lances"
              : `${lote.bidCount} ${lote.bidCount === 1 ? "lance" : "lances"}`}
          </Card.Description>
        </Card.Content>
        <PrazoLote lote={lote} />
      </Card.Content>
      <Card.Footer className="mt-auto flex-row flex-nowrap items-center justify-between gap-2 px-5 pb-5">
        <Link
          href={endereco}
          aria-label={`${encerrado ? "Ver resultado" : "Abrir leilão"}: ${lote.item.title}`}
          className={buttonVariants({
            variant: encerrado ? "secondary" : "primary",
            size: "md",
          })}
        >
          {encerrado ? "Ver resultado" : "Abrir leilão"}
          <Link.Icon>
            <Icone nome="seta" />
          </Link.Icon>
        </Link>
        {["live", "scheduled"].includes(lote.status) && (
          <BotaoAcompanhar id={lote.id} compacto />
        )}
      </Card.Footer>
      {children && (
        <Card.Content className="gap-3 border-t border-border/60 px-5 py-4">
          {children}
        </Card.Content>
      )}
    </Card>
  );
}
