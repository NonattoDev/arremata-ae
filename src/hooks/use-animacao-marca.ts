"use client";

import { useCallback, useEffect } from "react";
import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";

export function useAnimacaoMarca() {
  const [simbolo, animar] = useAnimate<HTMLImageElement>();
  const movimentoReduzido = useReducedMotion();

  const destacar = useCallback(() => {
    if (!simbolo.current || movimentoReduzido !== false) return;
    // Um gesto curto lembra a batida do martelo sem distrair durante os lances.
    return animar(
      simbolo.current,
      {
        transform: [
          "rotate(0deg) scale(1)",
          "rotate(-14deg) scale(1.08)",
          "rotate(7deg) scale(1.04)",
          "rotate(0deg) scale(1)",
        ],
      },
      { duration: 0.55, ease: "easeInOut" },
    );
  }, [animar, movimentoReduzido, simbolo]);

  useEffect(() => {
    if (movimentoReduzido && simbolo.current) {
      animar(simbolo.current, { transform: "none" }, { duration: 0 });
      return;
    }
    const animacao = destacar();
    return () => animacao?.stop();
  }, [animar, destacar, movimentoReduzido, simbolo]);

  return { simbolo, destacar };
}
