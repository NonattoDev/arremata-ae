"use client";
import { formatarDataAcervo } from "@/lib/datas";
import { useEffect, useState } from "react";
import { Button, Card, Chip, Link, buttonVariants } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { historiasObras } from "@/lib/historias-obras";
import type { Lote } from "@/tipos/leilao";
import { GaleriaObra } from "@/componentes/leiloes/galeria-obra";
import { BotaoAcompanhar } from "@/componentes/leiloes/botao-acompanhar";
import { IndicadorAoVivo } from "@/componentes/leiloes/indicador-ao-vivo";
import { Icone } from "@/componentes/ui/icone";
const ConteudoAnimado = motion.create(Card.Content);

export function CarrosselDestaques({ lotes }: { lotes: Lote[] }) {
  const [indice, definirIndice] = useState(0);
  const posicao = lotes.length ? indice % lotes.length : 0;
  const lote = lotes[posicao];
  const movimentoReduzido = useReducedMotion();
  const [galeriaAberta, definirGaleriaAberta] = useState(false);
  const [paginaVisivel, definirPaginaVisivel] = useState(true);
  const automatico = paginaVisivel && !galeriaAberta;
  useEffect(() => {
    const atualizar = () => definirPaginaVisivel(!document.hidden);
    atualizar();
    document.addEventListener("visibilitychange", atualizar);
    return () => document.removeEventListener("visibilitychange", atualizar);
  }, []);
  useEffect(() => {
    if (!automatico || lotes.length < 2) return;
    const intervalo = window.setInterval(
      () => definirIndice((atual) => (atual + 1) % lotes.length),
      8000,
    );
    return () => window.clearInterval(intervalo);
  }, [automatico, lotes.length, indice]);
  if (!lote) return null;
  return (
    <Card
      role="region"
      aria-roledescription="carrossel"
      aria-label="Leilões em destaque"
      className="gap-4 rounded-none border-t border-border p-6 sm:p-8 lg:border-t-0 lg:border-l"
    >
      <Card.Header className="flex-row items-center justify-between gap-3">
        {lote.status === "live" ? (
          <IndicadorAoVivo />
        ) : (
          <Chip size="sm" variant="tertiary">
            Em destaque
          </Chip>
        )}
        <Card.Description>{formatarDataAcervo(lote.item.date ?? "")}</Card.Description>
      </Card.Header>
      <AnimatePresence mode="wait" initial={false}>
        <ConteudoAnimado
          key={lote.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: movimentoReduzido ? 0 : 0.65,
            ease: "easeInOut",
          }}
          className="gap-4 p-0"
        >
          <GaleriaObra
            lote={lote}
            destaque
            className="h-64 p-0 sm:h-80"
            aoMudarAbertura={definirGaleriaAberta}
          />
          <Card.Footer className="justify-between gap-4">
            <Card.Header>
              <Card.Title className="text-lg">{lote.item.title}</Card.Title>
              <Card.Description>{lote.item.artist}</Card.Description>
            </Card.Header>
            <Link
              href={`/lotes/${lote.id}`}
              aria-label={`Abrir lote: ${lote.item.title}`}
              className={buttonVariants({
                variant: "secondary",
                isIconOnly: true,
              })}
            >
              <Icone nome="seta" />
            </Link>
          </Card.Footer>
          <Card.Description className="line-clamp-2 h-10 text-sm leading-5">
            {historiasObras[lote.item.externalId]?.contexto}
          </Card.Description>
          <BotaoAcompanhar id={lote.id} compacto />
        </ConteudoAnimado>
      </AnimatePresence>
      {lotes.length > 1 && (
        <Card.Footer className="items-center justify-between gap-3">
          <Button
            isIconOnly
            variant="secondary"
            aria-label="Destaque anterior"
            onPress={() =>
              definirIndice(
                (atual) => (atual - 1 + lotes.length) % lotes.length,
              )
            }
          >
            <Icone nome="voltar" />
          </Button>
          <Card.Description
            role="status"
            aria-live={automatico ? "off" : "polite"}
          >
            {posicao + 1} de {lotes.length} · Em destaque
          </Card.Description>
          <Button
            isIconOnly
            variant="secondary"
            aria-label="Próximo destaque"
            onPress={() => definirIndice((atual) => (atual + 1) % lotes.length)}
          >
            <Icone nome="voltar" className="rotate-180" />
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
