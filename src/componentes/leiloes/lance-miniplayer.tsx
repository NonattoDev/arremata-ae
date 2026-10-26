"use client";

import { useState } from "react";
import { Button, Card } from "@heroui/react";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
import { Icone } from "@/componentes/ui/icone";
import { FormularioLance } from "@/funcionalidades/leiloes/formulario-lance";
import type { Sala } from "@/tipos/leilao";

export function LanceMiniplayer({
  lote,
  atualizar,
  erroConsulta,
}: {
  lote: Sala;
  atualizar: () => Promise<void>;
  erroConsulta: string;
}) {
  const { dados } = useSessao();
  const [aberto, definirAberto] = useState(false);
  if (
    dados?.user?.role !== "bidder" ||
    lote.isOwner ||
    lote.status !== "live" ||
    !lote.intact
  )
    return null;

  return (
    <Card.Content className="gap-3 border-t border-border pt-3">
      <Button
        size="sm"
        variant="secondary"
        className="min-h-11 gap-2"
        aria-expanded={aberto}
        aria-controls={`lance-miniplayer-${lote.id}`}
        isDisabled={!aberto && (lote.isLeader || !!erroConsulta)}
        onPress={() => definirAberto(!aberto)}
      >
        <Icone nome={aberto ? "recolher" : "leilao"} />
        {aberto
          ? "Recolher lance"
          : lote.isLeader
            ? "Você está na liderança"
            : "Dar lance"}
      </Button>
      {aberto && (
        <Card.Content id={`lance-miniplayer-${lote.id}`} className="gap-3">
          <FormularioLance
            compacto
            lote={lote}
            atualizar={atualizar}
            erroConsulta={erroConsulta}
          />
        </Card.Content>
      )}
    </Card.Content>
  );
}
