"use client";

import { useEffect } from "react";
import { Chip } from "@heroui/react";
import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";

export function IndicadorAoVivo({
  rotulo = "Aberto para lances",
  forte = false,
}: {
  rotulo?: string;
  forte?: boolean;
}) {
  const [indicador, animar] = useAnimate<HTMLSpanElement>();
  const movimentoReduzido = useReducedMotion();

  useEffect(() => {
    if (!indicador.current) return;
    if (movimentoReduzido !== false) {
      animar(indicador.current, { opacity: 1 }, { duration: 0 });
      return;
    }
    // Só o ponto pulsa: o texto permanece legível durante a disputa.
    const pulsacao = animar(
      indicador.current,
      { opacity: [1, 0.35, 1] },
      { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    );
    return () => pulsacao.stop();
  }, [animar, indicador, movimentoReduzido]);

  return (
    <Chip
      color="success"
      variant="soft"
      size="sm"
      className={`w-fit gap-2 ${forte ? "bg-emerald-700 text-white" : ""}`}
    >
      <Chip.Label ref={indicador} aria-hidden="true">
        ●
      </Chip.Label>
      <Chip.Label>{rotulo}</Chip.Label>
    </Chip>
  );
}
