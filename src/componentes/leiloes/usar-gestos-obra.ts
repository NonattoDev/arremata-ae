"use client";

import {
  useEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

export function usarGestosObra(
  area: RefObject<HTMLDivElement | null>,
  zoom: number,
  definirZoom: Dispatch<SetStateAction<number>>,
) {
  const zoomAtual = useRef(zoom);
  useEffect(() => {
    zoomAtual.current = zoom;
  }, [zoom]);

  useEffect(() => {
    const elemento = area.current;
    if (!elemento) return;
    let pinca: { distancia: number; zoom: number } | null = null;
    let ultimaRoda = 0;
    const limitar = (valor: number) =>
      Math.min(4, Math.max(1, Math.round(valor)));
    const distancia = (toques: TouchList) =>
      Math.hypot(
        toques[0].clientX - toques[1].clientX,
        toques[0].clientY - toques[1].clientY,
      );
    const roda = (evento: WheelEvent) => {
      if (!evento.deltaY || evento.ctrlKey) return;
      evento.preventDefault();
      // Agrupa os eventos do trackpad para não saltar todos os níveis de uma vez.
      if (evento.timeStamp - ultimaRoda < 140) return;
      ultimaRoda = evento.timeStamp;
      definirZoom((atual) => limitar(atual + (evento.deltaY < 0 ? 1 : -1)));
    };
    const iniciar = (evento: TouchEvent) => {
      if (evento.touches.length !== 2) return;
      evento.preventDefault();
      pinca = { distancia: distancia(evento.touches), zoom: zoomAtual.current };
    };
    const mover = (evento: TouchEvent) => {
      if (!pinca || evento.touches.length !== 2) return;
      evento.preventDefault();
      if (pinca.distancia > 0)
        definirZoom(
          limitar((pinca.zoom * distancia(evento.touches)) / pinca.distancia),
        );
    };
    const terminar = () => {
      pinca = null;
    };
    elemento.addEventListener("wheel", roda, { passive: false });
    elemento.addEventListener("touchstart", iniciar, { passive: false });
    elemento.addEventListener("touchmove", mover, { passive: false });
    elemento.addEventListener("touchend", terminar);
    elemento.addEventListener("touchcancel", terminar);
    return () => {
      elemento.removeEventListener("wheel", roda);
      elemento.removeEventListener("touchstart", iniciar);
      elemento.removeEventListener("touchmove", mover);
      elemento.removeEventListener("touchend", terminar);
      elemento.removeEventListener("touchcancel", terminar);
    };
  }, [area, definirZoom]);
}
