"use client";

import { useEffect } from "react";
import { Chip } from "@heroui/react";
import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";

export function PalavraArte() {
  const [referencia, animar] = useAnimate<HTMLSpanElement>();
  const movimentoReduzido = useReducedMotion();

  useEffect(() => {
    const elemento = referencia.current;
    if (!elemento || movimentoReduzido !== false) return;

    // Transformação discreta, sem mudar a largura ou a posição do restante do título.
    const animacao = animar(
      elemento,
      {
        transform: [
          "translateY(0) rotate(0deg)",
          "translateY(-2px) rotate(-0.7deg)",
          "translateY(0) rotate(0deg)",
          "translateY(0) rotate(0deg)",
        ],
      },
      { duration: 6, repeat: Infinity, ease: "easeInOut" },
    );
    const atualizarVisibilidade = () =>
      document.hidden ? animacao.pause() : animacao.play();
    atualizarVisibilidade();
    document.addEventListener("visibilitychange", atualizarVisibilidade);
    return () => {
      document.removeEventListener("visibilitychange", atualizarVisibilidade);
      animacao.cancel();
    };
  }, [animar, referencia, movimentoReduzido]);

  return (
    <Chip.Label
      ref={referencia}
      className="inline-block origin-center font-[family-name:var(--fonte-arte)] text-[1.2em] font-normal italic leading-none tracking-tight text-orange-600 dark:text-orange-400"
    >
      arte
    </Chip.Label>
  );
}
