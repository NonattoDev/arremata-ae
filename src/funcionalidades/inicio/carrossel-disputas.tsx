"use client";

import { useId, useRef, useState } from "react";
import { Button, Card, Typography } from "@heroui/react";
import { CartaoLote } from "@/componentes/leiloes/cartao-lote";
import { Icone } from "@/componentes/ui/icone";
import type { Lote } from "@/tipos/leilao";

export function CarrosselDisputas({ lotes }: { lotes: Lote[] }) {
  const faixa = useRef<HTMLDivElement>(null);
  const identificador = useId();
  const [posicao, definirPosicao] = useState(0);
  const destaques = [...lotes]
    .sort((a, b) => b.bidCount - a.bidCount || a.endsAt.localeCompare(b.endsAt) || a.id.localeCompare(b.id))
    .slice(0, 12);

  function mover(direcao: number) {
    const elemento = faixa.current;
    if (!elemento) return;
    const cartao = elemento.firstElementChild as HTMLElement | null;
    const passo = (cartao?.offsetWidth ?? elemento.clientWidth) + 24;
    elemento.scrollBy({
      left: direcao * passo,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  return (
    <Card variant="transparent" className="min-w-0 gap-3 p-0">
      <Card.Content className="flex-row items-center justify-between gap-3 p-0">
        <Typography className="text-sm text-muted">Destaques da disputa · {destaques.length} obras</Typography>
        <Card.Content className="flex-none flex-row gap-2 p-0">
          <Button isIconOnly variant="secondary" aria-label="Obras anteriores" aria-controls={identificador} isDisabled={posicao <= 0} onPress={() => mover(-1)}>
            <Icone nome="voltar" />
          </Button>
          <Button isIconOnly variant="secondary" aria-label="Próximas obras" aria-controls={identificador} isDisabled={posicao >= 1} onPress={() => mover(1)}>
            <Icone nome="voltar" className="rotate-180" />
          </Button>
        </Card.Content>
      </Card.Content>
      <Card.Content
        ref={faixa}
        id={identificador}
        role="region"
        aria-label="Carrossel de leilões em destaque"
        tabIndex={0}
        onScroll={(evento) => {
          const elemento = evento.currentTarget;
          const limite = elemento.scrollWidth - elemento.clientWidth;
          definirPosicao(limite <= 1 || elemento.scrollLeft >= limite - 2 ? 1 : elemento.scrollLeft / limite);
        }}
        className="flex-row items-stretch gap-6 overflow-x-auto snap-x snap-mandatory p-1 pb-4"
      >
        {destaques.map((lote) => (
          <Card.Content key={lote.id} className="w-[86%] flex-none snap-start p-0 sm:w-[calc((100%-24px)/2)] xl:w-[calc((100%-48px)/3)] 2xl:w-[calc((100%-72px)/4)]">
            <CartaoLote lote={lote} />
          </Card.Content>
        ))}
      </Card.Content>
    </Card>
  );
}
