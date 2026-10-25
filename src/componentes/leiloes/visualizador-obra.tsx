"use client";

import { useEffect, useLayoutEffect, useId, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { Button, Card, Surface } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";

export function VisualizadorObra({
  imagem,
  titulo,
}: {
  imagem: string;
  titulo: string;
}) {
  const [zoom, definirZoom] = useState(1);
  const ampliada = zoom > 1;
  const instrucao = useId();
  const posicao = useRef({ horizontal: 0.5, vertical: 0.5 });
  const tamanhos = ["", "h-full w-full p-3 sm:p-5", "h-[200%] w-[200%]", "h-[300%] w-[300%]", "h-[400%] w-[400%]"];
  const area = useRef<HTMLDivElement>(null);
  const alternarZoom = () => {
    definirZoom(1);
    area.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };
  useEffect(() => {
    const elemento = area.current;
    if (!elemento) return;
    const ajustarPelaRoda = (evento: WheelEvent) => {
      // Antes de ativar a lupa, a rolagem segue livre. Ctrl preserva o zoom do navegador.
      if (!ampliada || evento.ctrlKey || !evento.deltaY) return;
      evento.preventDefault();
      definirZoom((atual) => Math.min(4, Math.max(1, atual + (evento.deltaY < 0 ? 1 : -1))));
    };
    elemento.addEventListener("wheel", ajustarPelaRoda, { passive: false });
    return () => elemento.removeEventListener("wheel", ajustarPelaRoda);
  }, [ampliada]);
  useLayoutEffect(() => {
    const elemento = area.current;
    if (!elemento) return;
    elemento.scrollTo({
      left: posicao.current.horizontal * (elemento.scrollWidth - elemento.clientWidth),
      top: posicao.current.vertical * (elemento.scrollHeight - elemento.clientHeight),
      behavior: "instant",
    });
  }, [zoom]);
  const acompanharPonteiro = (evento: PointerEvent<HTMLDivElement>) => {
    // O toque continua com rolagem nativa; o mouse posiciona a ampliação.
    if (!ampliada || evento.pointerType !== "mouse") return;
    const elemento = evento.currentTarget;
    const limites = elemento.getBoundingClientRect();
    const limitar = (valor: number) => Math.min(1, Math.max(0, valor));
    const horizontal = limitar((evento.clientX - limites.left) / limites.width);
    const vertical = limitar((evento.clientY - limites.top) / limites.height);
    posicao.current = { horizontal, vertical };
    elemento.scrollTo({
      left: horizontal * (elemento.scrollWidth - elemento.clientWidth),
      top: vertical * (elemento.scrollHeight - elemento.clientHeight),
      behavior: "instant",
    });
  };
  return (
    <Card.Content className="gap-3">
      <Surface
        ref={area}
        variant="secondary"
        role="region"
        aria-label={
          ampliada
            ? "Obra ampliada: mova o mouse ou deslize para explorar os detalhes"
            : "Obra completa"
        }
        tabIndex={0}
        aria-describedby={instrucao}
        onPointerMove={acompanharPonteiro}
        className={`h-[52dvh] min-h-48 overflow-auto rounded-2xl sm:h-[60dvh] ${ampliada ? "cursor-crosshair" : ""}`}
      >
        <Image
          src={imagem}
          alt={titulo}
          width={1200}
          height={900}
          unoptimized
          draggable={false}
          className={`block max-w-none object-contain ${tamanhos[zoom]}`}
        />
      </Surface>
      <Card.Content className="flex-row flex-wrap items-center justify-between gap-3">
        <Card.Description id={instrucao} className="text-sm">
          {ampliada
            ? "Mova o mouse para explorar e use a rodinha para ajustar o zoom. No celular, deslize. Pelo teclado, use as setas."
            : "Veja a obra inteira ou amplie os detalhes."}
        </Card.Description>
        <Card.Content role="group" aria-label="Controles de zoom" className="flex-row flex-wrap items-center gap-2">
          <Button variant="secondary" className="min-h-11" aria-label="Diminuir zoom" isDisabled={zoom === 1} onPress={() => definirZoom((atual) => Math.max(1, atual - 1))}><Icone nome="reduzir" /></Button>
          <Card.Description role="status">{zoom}×</Card.Description>
          <Button variant="secondary" className="min-h-11" aria-label="Aumentar zoom" isDisabled={zoom === 4} onPress={() => definirZoom((atual) => Math.min(4, atual + 1))}><Icone nome="ampliar" /></Button>
          <Button variant="secondary" className="min-h-11" isDisabled={!ampliada} onPress={alternarZoom}>Ver obra inteira</Button>
        </Card.Content>
      </Card.Content>
    </Card.Content>
  );
}
