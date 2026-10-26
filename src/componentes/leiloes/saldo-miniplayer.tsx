"use client";

import { Card, Link, Typography } from "@heroui/react";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
import { Icone } from "@/componentes/ui/icone";
import { useRecurso } from "@/hooks/use-recurso";
import { formatarReais } from "@/lib/formatacao";

export function SaldoMiniplayer() {
  const { dados } = useSessao();
  const licitante = dados?.user?.role === "bidder";
  const carteira = useRecurso<{ available: number }>(
    licitante ? "wallet" : null,
    true,
  );
  if (!licitante) return null;

  return (
    <Card.Content className="flex-row flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-secondary p-3">
      <Card.Content className="min-w-0 gap-1 p-0">
        <Card.Description className="flex items-center gap-2 text-xs">
          <Icone nome="carteira" /> Disponível para lances
        </Card.Description>
        <Typography className="text-sm font-semibold tabular-nums">
          {carteira.erro
            ? "Saldo indisponível"
            : carteira.dados
              ? formatarReais(carteira.dados.available)
              : "Carregando…"}
        </Typography>
      </Card.Content>
      <Link
        href="/carteira"
        className="inline-flex shrink-0 items-center gap-1.5 text-xs no-underline"
      >
        <Icone nome="carteira" />
        Ver carteira
      </Link>
    </Card.Content>
  );
}
