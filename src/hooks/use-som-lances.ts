"use client";

import { useEffect, useRef, useState } from "react";
import { useRecurso } from "./use-recurso";
import {
  detectarNovosLances,
  selecionarLancesAudiveis,
} from "@/lib/novos-lances";
import type { Lote } from "@/tipos/leilao";

export function useSomLances(ids: string[], silenciados: string[]) {
  const [ativo, definirAtivo] = useState(false);
  const [erro, definirErro] = useState("");
  const contexto = useRef<AudioContext | null>(null);
  const anteriores = useRef(new Map<string, number>());
  const reiniciarComparacao = useRef(true);
  const { dados } = useRecurso<Lote[]>(
    ativo && ids.length ? "lots" : null,
    ativo,
  );

  useEffect(() => {
    // Ao voltar à aba, a primeira consulta vira referência, sem avisos atrasados.
    const mudarVisibilidade = () => {
      reiniciarComparacao.current = true;
    };
    document.addEventListener("visibilitychange", mudarVisibilidade);
    return () => {
      document.removeEventListener("visibilitychange", mudarVisibilidade);
      void contexto.current?.close();
      contexto.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ativo || !dados) return;
    const selecionados = selecionarLancesAudiveis(dados, ids, silenciados);
    const novoLance = detectarNovosLances(anteriores.current, selecionados);
    const podeTocar = !reiniciarComparacao.current && !document.hidden;
    anteriores.current = new Map(
      selecionados.map((lote) => [lote.id, lote.bidCount]),
    );
    reiniciarComparacao.current = false;
    const audio = contexto.current;
    if (!novoLance || !podeTocar || !audio || audio.state !== "running") return;

    // Um único toque por atualização, mesmo se vários lotes receberem lances.
    const oscilador = audio.createOscillator();
    const volume = audio.createGain();
    const agora = audio.currentTime;
    oscilador.type = "sine";
    oscilador.frequency.setValueAtTime(660, agora);
    oscilador.frequency.setValueAtTime(880, agora + 0.12);
    volume.gain.setValueAtTime(0, agora);
    volume.gain.linearRampToValueAtTime(0.07, agora + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.001, agora + 0.35);
    oscilador.connect(volume);
    volume.connect(audio.destination);
    oscilador.onended = () => {
      oscilador.disconnect();
      volume.disconnect();
    };
    oscilador.start(agora);
    oscilador.stop(agora + 0.36);
  }, [dados, ativo, ids, silenciados]);

  async function alternar() {
    definirErro("");
    if (ativo) {
      definirAtivo(false);
      await contexto.current?.suspend();
      return;
    }
    try {
      // O clique libera o áudio de acordo com as regras do navegador.
      contexto.current ??= new AudioContext();
      await contexto.current.resume();
      if (contexto.current.state !== "running") throw new Error();
      reiniciarComparacao.current = true;
      anteriores.current.clear();
      definirAtivo(true);
    } catch {
      definirErro(
        "Não foi possível ativar o som neste navegador. Tente novamente.",
      );
    }
  }

  return { ativo, alternar, erro };
}
