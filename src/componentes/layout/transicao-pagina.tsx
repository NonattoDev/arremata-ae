"use client";

import { Card } from "@heroui/react";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function TransicaoPagina({ children: filhos }: { children: ReactNode }) {
  const elemento = useRef<HTMLDivElement>(null);
  const caminho = usePathname();
  useEffect(() => {
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preferencia.matches || !elemento.current?.animate) return;
    const animacao = elemento.current.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 180, easing: "ease-out" },
    );
    const respeitarPreferencia = () => {
      if (preferencia.matches) animacao.cancel();
    };
    preferencia.addEventListener("change", respeitarPreferencia);
    return () => {
      animacao.cancel();
      preferencia.removeEventListener("change", respeitarPreferencia);
    };
  }, [caminho]);
  return (
    <Card ref={elemento} variant="transparent" className="min-w-0 p-0">
      {filhos}
    </Card>
  );
}
