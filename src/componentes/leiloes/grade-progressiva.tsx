"use client";

import { useEffect, useRef } from "react";
import { Button, Card, Typography } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { CartaoLote } from "./cartao-lote";
import { Icone } from "@/componentes/ui/icone";
import type { Lote } from "@/tipos/leilao";

const EntradaObra = motion.create(Card.Content);

export function GradeProgressiva({
  lotes,
  total,
  temMais,
  carregando,
  carregarMais,
}: {
  lotes: Lote[];
  total: number;
  temMais: boolean;
  carregando: boolean;
  carregarMais: () => void;
}) {
  const reduzirMovimento = useReducedMotion();
  const sentinela = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = sentinela.current;
    if (!elemento || !temMais || carregando) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        carregarMais();
      },
      { rootMargin: "300px" },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [lotes.length, temMais, carregando, carregarMais]);

  return (
    <Card.Content className="min-w-0 gap-6 p-0">
      <Card.Content className="grid min-w-0 gap-6 p-0 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {lotes.map((lote, indice) => (
          <EntradaObra
            key={lote.id}
            className="min-w-0 p-0 [&>div]:h-full"
            initial={reduzirMovimento ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{
              duration: reduzirMovimento ? 0 : 0.8,
              delay: reduzirMovimento ? 0 : (indice % 3) * 0.08,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <CartaoLote lote={lote} />
          </EntradaObra>
        ))}
      </Card.Content>
      <Card.Content ref={sentinela} className="items-center gap-3 py-5">
        <Typography className="text-xs text-muted" aria-live="polite">
          {lotes.length} de {total} obras
        </Typography>
        {temMais ? (
          <Button
            variant="secondary"
            className="gap-2"
            onPress={carregarMais}
            isPending={carregando}
          >
            <Icone nome="adicionar" />
            Carregar mais obras
          </Button>
        ) : (
          <Typography className="text-sm text-muted">
            Você viu todas as obras desta seleção.
          </Typography>
        )}
      </Card.Content>
    </Card.Content>
  );
}
