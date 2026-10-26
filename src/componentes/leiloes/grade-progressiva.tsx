"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card, Typography } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { CartaoLote } from "./cartao-lote";
import { Icone } from "@/componentes/ui/icone";
import type { Lote } from "@/tipos/leilao";

const tamanhoBloco = 12;
const EntradaObra = motion.create(Card.Content);

export function GradeProgressiva({ lotes }: { lotes: Lote[] }) {
  const reduzirMovimento = useReducedMotion();
  const [quantidade, definirQuantidade] = useState(tamanhoBloco);
  const sentinela = useRef<HTMLDivElement>(null);
  const temMais = quantidade < lotes.length;

  useEffect(() => {
    const elemento = sentinela.current;
    if (!elemento || !temMais) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        definirQuantidade((atual) => atual + tamanhoBloco);
      },
      { rootMargin: "300px" },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [quantidade, temMais]);

  return (
    <Card.Content className="min-w-0 gap-6 p-0">
      <Card.Content className="grid min-w-0 gap-6 p-0 md:grid-cols-2 xl:grid-cols-3">
        {lotes.slice(0, quantidade).map((lote, indice) => (
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
          {Math.min(quantidade, lotes.length)} de {lotes.length} obras
        </Typography>
        {temMais ? (
          <Button
            variant="secondary"
            className="gap-2"
            onPress={() => definirQuantidade((atual) => atual + tamanhoBloco)}
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
