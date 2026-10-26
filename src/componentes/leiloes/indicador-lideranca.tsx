"use client";

import { Chip } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { Icone } from "@/componentes/ui/icone";

const SeloAnimado = motion.create(Chip);

export function IndicadorLideranca() {
  const reduzirMovimento = useReducedMotion();
  return (
    <SeloAnimado
      color="success"
      variant="soft"
      size="sm"
      className="gap-1.5"
      animate={{ opacity: reduzirMovimento !== false ? 1 : [1, 0.6, 1] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Icone nome="confirmar" className="text-[16px]!" />
      Você está ganhando
    </SeloAnimado>
  );
}
