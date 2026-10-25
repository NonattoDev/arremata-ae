"use client";
import { Button, Card } from "@heroui/react";
import { useAcompanhamento } from "@/componentes/provedores/provedor-acompanhamento";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { LoteAcompanhado } from "./lote-acompanhado";
import { BotaoSomLances } from "./botao-som-lances";

export function PainelAcompanhamento() {
  const { ids, recolhido, alternar, remover, aviso } = useAcompanhamento();
  if (!ids.length) return null;
  return (
    <Card
      aria-label="Miniplayer de leilões"
      className="fixed right-3 bottom-3 z-30 w-[calc(100%-1.5rem)] max-w-sm gap-3 border border-border px-3 py-2 shadow-xl sm:right-6 sm:bottom-6"
    >
      <Card.Header className="flex-row items-center justify-between gap-3 p-0">
        <Card.Content className="min-w-0 gap-1">
          <Card.Title className="flex items-center gap-2 text-sm">
            <Icone nome="acompanhar" />
            Acompanhando · {ids.length}/5
          </Card.Title>
          {!recolhido && (
            <Card.Description className="text-xs">
              Continue navegando. Seus lotes ficam aqui.
            </Card.Description>
          )}
        </Card.Content>
        <BotaoSomLances />
        <Button
          size="sm"
          isIconOnly
          variant="secondary"
          className="min-h-11 min-w-11"
          aria-label={recolhido ? "Expandir miniplayer" : "Recolher miniplayer"}
          aria-expanded={!recolhido}
          aria-controls="lotes-acompanhados"
          onPress={alternar}
        >
          <Icone nome={recolhido ? "recolher" : "expandir"} />
        </Button>
      </Card.Header>
      {aviso && <Aviso>{aviso}</Aviso>}
      <Card.Content
        id="lotes-acompanhados"
        className={
          recolhido
            ? "hidden"
            : "flex max-h-[55dvh] flex-col gap-2 overflow-y-auto"
        }
      >
        {ids.map((id) => (
          <LoteAcompanhado key={id} id={id} remover={() => remover(id)} />
        ))}
      </Card.Content>
    </Card>
  );
}
