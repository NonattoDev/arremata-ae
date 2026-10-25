"use client";

import { useEffect, useRef, useState } from "react";
import { Card, Typography } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Sala } from "@/tipos/leilao";
import { formatarReais } from "@/lib/formatacao";
import { Icone } from "@/componentes/ui/icone";

const CartaoAnimado = motion.create(Card);
type Novidade = {
  sequencia: number;
  valor: number;
  superado: boolean;
  proprio: boolean;
};

export function AvisoNovoLance({ lote }: { lote: Sala }) {
  const anterior = useRef({ quantidade: lote.bidCount, lider: lote.isLeader });
  const [novidade, definirNovidade] = useState<Novidade | null>(null);
  const movimentoReduzido = useReducedMotion();

  useEffect(() => {
    if (lote.bidCount > anterior.current.quantidade && !document.hidden) {
      definirNovidade({
        sequencia: lote.bidCount,
        valor: lote.currentAmount,
        superado: anterior.current.lider && !lote.isLeader,
        proprio: lote.isLeader,
      });
    }
    anterior.current = { quantidade: lote.bidCount, lider: lote.isLeader };
  }, [lote.bidCount, lote.currentAmount, lote.isLeader]);

  useEffect(() => {
    if (!novidade) return;
    const temporizador = window.setTimeout(() => definirNovidade(null), 12000);
    return () => window.clearTimeout(temporizador);
  }, [novidade]);

  return (
    <AnimatePresence initial={false}>
      {novidade && (
        <CartaoAnimado
          key={novidade.sequencia}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          initial={{ opacity: 0, y: movimentoReduzido ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: movimentoReduzido ? 0 : -6 }}
          transition={{
            duration: movimentoReduzido ? 0 : 0.35,
            ease: "easeOut",
          }}
          className={`gap-2 rounded-2xl border p-4 shadow-sm ${novidade.superado ? "border-orange-300 bg-orange-50 text-orange-950 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-100" : "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100"}`}
        >
          <Card.Title className="flex items-center gap-2 text-sm">
            <Icone nome={novidade.superado ? "leilao" : "confirmar"} />
            {novidade.superado
              ? "Você foi superado!"
              : novidade.proprio
                ? "Seu lance entrou!"
                : "Novo lance recebido"}
          </Card.Title>
          <Typography className="text-sm">
            {formatarReais(novidade.valor)} ·{" "}
            {novidade.superado
              ? "Outro participante assumiu a liderança."
              : novidade.proprio
                ? "Você está na liderança."
                : "A disputa foi atualizada."}
          </Typography>
        </CartaoAnimado>
      )}
    </AnimatePresence>
  );
}
