"use client";

import { Button, Card } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import { useAcompanhamento } from "@/componentes/provedores/provedor-acompanhamento";

export function BotaoSomLances() {
  const {
    som: { ativo, alternar, erro },
  } = useAcompanhamento();
  const rotulo = ativo
    ? "Desativar som de todos os leilões acompanhados"
    : "Ativar som dos leilões acompanhados";
  return (
    <Card.Content className="relative flex-none p-0">
      <Button
        isIconOnly
        variant={ativo ? "primary" : "secondary"}
        className="min-h-11 min-w-11"
        aria-label={rotulo}
        aria-pressed={ativo}
        onPress={() => void alternar()}
      >
        <Icone nome={ativo ? "som" : "semSom"} />
      </Button>
      {erro && (
        <Card.Description
          role="alert"
          className="absolute right-0 top-full z-50 w-60 rounded-xl bg-surface p-3 shadow-lg"
        >
          {erro}
        </Card.Description>
      )}
    </Card.Content>
  );
}
