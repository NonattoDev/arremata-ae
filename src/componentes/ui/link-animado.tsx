"use client";
import { Icone } from "@/componentes/ui/icone";

import { useEffect, type ReactNode } from "react";
import { Link, buttonVariants } from "@heroui/react";
import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";

export function LinkAnimado({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const [referencia, animar] = useAnimate<HTMLAnchorElement>();
  const movimentoReduzido = useReducedMotion();

  useEffect(() => {
    if (!referencia.current) return;
    if (movimentoReduzido !== false) {
      animar(
        referencia.current,
        { opacity: 1, transform: "none" },
        { duration: 0 },
      );
      animar("[data-seta]", { transform: "none" }, { duration: 0 });
      return;
    }
    const entrada = animar(
      referencia.current,
      { opacity: [0, 1], transform: ["translateY(8px)", "translateY(0px)"] },
      { duration: 0.45, ease: "easeOut" },
    );
    return () => entrada.stop();
  }, [animar, movimentoReduzido, referencia]);

  const destacar = () => {
    if (movimentoReduzido !== false) return;
    animar(
      "[data-seta]",
      { transform: "translate(4px, -4px)" },
      { duration: 0.2, ease: "easeOut" },
    );
  };
  const restaurar = () => {
    if (movimentoReduzido !== false) return;
    animar(
      "[data-seta]",
      { transform: "translate(0px, 0px)" },
      { duration: 0.2, ease: "easeOut" },
    );
  };

  return (
    <Link
      ref={referencia}
      href={href}
      className={buttonVariants({ size: "lg", variant: "primary" })}
      onHoverStart={destacar}
      onHoverEnd={restaurar}
      onFocus={destacar}
      onBlur={restaurar}
    >
      {children}
      <Link.Icon data-seta aria-hidden="true">
        <Icone nome="seta" />
      </Link.Icon>
    </Link>
  );
}
