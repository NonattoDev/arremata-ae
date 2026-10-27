"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button, Card, Typography } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CartaoLote } from "@/componentes/leiloes/cartao-lote";
import { Icone } from "@/componentes/ui/icone";
import type { Lote } from "@/tipos/leilao";

const PaginaAnimada = motion.create(Card.Content);

export function CarrosselDisputas({ lotes }: { lotes: Lote[] }) {
  const identificador = useId();
  const inicioToque = useRef<number | null>(null);
  const [indice, definirIndice] = useState(0);
  const [porPagina, definirPorPagina] = useState(1);
  const reduzirMovimento = useReducedMotion();
  const destaques = [...lotes]
    .sort((a, b) => b.bidCount - a.bidCount || a.endsAt.localeCompare(b.endsAt) || a.id.localeCompare(b.id))
    .slice(0, 12);
  const paginas = Math.max(1, Math.ceil(destaques.length / porPagina));
  const atual = indice % paginas;
  const visiveis = destaques.slice(atual * porPagina, (atual + 1) * porPagina);

  useEffect(() => {
    const consultas = [640, 1280, 1536].map((largura) => window.matchMedia(`(min-width: ${largura}px)`));
    const atualizar = () => definirPorPagina(1 + consultas.filter((consulta) => consulta.matches).length);
    atualizar();
    consultas.forEach((consulta) => consulta.addEventListener("change", atualizar));
    return () => consultas.forEach((consulta) => consulta.removeEventListener("change", atualizar));
  }, []);

  useEffect(() => {
    if (paginas < 2 || reduzirMovimento) return;
    const intervalo = window.setInterval(() => {
      // A obra aberta no modal precisa continuar disponível até a pessoa fechar.
      if (!document.hidden && !document.querySelector('[role="dialog"]')) {
        definirIndice((anterior) => (anterior + 1) % paginas);
      }
    }, 6500);
    return () => window.clearInterval(intervalo);
  }, [paginas, indice, reduzirMovimento]);

  function mover(direcao: number) {
    definirIndice((anterior) => (anterior + direcao + paginas) % paginas);
  }

  return (
    <Card variant="transparent" className="min-w-0 gap-5 p-0" role="region" aria-roledescription="carrossel" aria-label="Carrossel de leilões em destaque">
      <Card.Content
        id={identificador}
        className="min-w-0 overflow-hidden p-1"
        onTouchStart={(evento) => { inicioToque.current = evento.touches[0].clientX; }}
        onTouchEnd={(evento) => {
          if (inicioToque.current !== null) {
            const distancia = evento.changedTouches[0].clientX - inicioToque.current;
            if (Math.abs(distancia) > 60) mover(distancia < 0 ? 1 : -1);
          }
          inicioToque.current = null;
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <PaginaAnimada
            key={`${atual}-${porPagina}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reduzirMovimento ? 0 : 0.5, ease: "easeInOut" }}
            className="grid min-w-0 items-stretch gap-6 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          >
            {visiveis.map((lote) => <CartaoLote key={lote.id} lote={lote} />)}
          </PaginaAnimada>
        </AnimatePresence>
      </Card.Content>
      <Card.Footer className="justify-center gap-3 p-0">
        <Button isIconOnly variant="secondary" aria-label="Obras anteriores" aria-controls={identificador} isDisabled={paginas < 2} onPress={() => mover(-1)}>
          <Icone nome="voltar" />
        </Button>
        <Card.Content className="hidden flex-none flex-row items-center gap-1 p-0 sm:flex">
          {Array.from({ length: paginas }, (_, pagina) => (
            <Button key={pagina} isIconOnly size="sm" variant="ghost" aria-label={`Ver grupo ${pagina + 1} de obras`} aria-current={pagina === atual ? "true" : undefined} onPress={() => definirIndice(pagina)}>
              <Typography aria-hidden="true" className={pagina === atual ? "text-accent" : "text-muted"}>{pagina === atual ? "━" : "•"}</Typography>
            </Button>
          ))}
        </Card.Content>
        <Typography className="text-sm tabular-nums text-muted sm:hidden">{atual + 1} / {paginas}</Typography>
        <Button isIconOnly variant="secondary" aria-label="Próximas obras" aria-controls={identificador} isDisabled={paginas < 2} onPress={() => mover(1)}>
          <Icone nome="voltar" className="rotate-180" />
        </Button>
      </Card.Footer>
    </Card>
  );
}
