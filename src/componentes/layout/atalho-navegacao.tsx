"use client";

import { useState } from "react";
import { Chip, Link } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";

const IconeAnimado = motion.create(Chip.Label);
export const coresIconesNavegacao: Partial<Record<NomeIcone, string>> = {
  inicio: "text-blue-600 dark:text-blue-400",
  leilao: "text-orange-600 dark:text-orange-400",
  comprovante: "text-violet-600 dark:text-violet-400",
  carteira: "text-emerald-600 dark:text-emerald-400",
};

export function AtalhoNavegacao({
  href,
  rotulo,
  ativo,
  icone,
}: {
  href: string;
  rotulo: string;
  ativo: boolean;
  icone: NomeIcone;
}) {
  const [sobre, definirSobre] = useState(false);
  const movimentoReduzido = useReducedMotion();
  const flutuando = sobre && movimentoReduzido === false;

  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      onHoverStart={() => definirSobre(true)}
      onHoverEnd={() => definirSobre(false)}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full px-3 text-sm leading-none whitespace-nowrap no-underline! transition-colors duration-200 hover:bg-accent-soft hover:text-accent data-[hovered=true]:bg-accent-soft data-[hovered=true]:text-accent motion-reduce:transition-none ${ativo ? "bg-surface-secondary" : ""}`}
    >
      <IconeAnimado
        className="flex h-5 w-5 shrink-0 items-center justify-center"
        animate={{ y: flutuando ? [0, -3, 0] : 0 }}
        transition={
          flutuando
            ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: movimentoReduzido ? 0 : 0.2 }
        }
      >
        <Icone nome={icone} className={coresIconesNavegacao[icone]} />
      </IconeAnimado>
      {rotulo}
    </Link>
  );
}
