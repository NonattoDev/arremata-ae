"use client";
import { Icone } from "@/componentes/ui/icone";
import { useState } from "react";

import { Button, Chip } from "@heroui/react";

export function Compartilhar({
  caminho,
  compacto = false,
}: {
  caminho: string;
  compacto?: boolean;
}) {
  const [copiado, definirCopiado] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={copiado ? "Link copiado" : "Copiar link público"}
      className={compacto ? "group min-h-8 min-w-8 gap-0 px-2" : undefined}
      onPress={async () => {
        try {
          await navigator.clipboard.writeText(
            `${window.location.origin}${caminho}`,
          );
          definirCopiado(true);
        } catch {
          definirCopiado(false);
        }
      }}
    >
      <Icone nome={copiado ? "confirmar" : "copiar"} />
      <Chip.Label
        aria-live="polite"
        className={
          compacto
            ? "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-40 group-focus-visible:opacity-100 motion-reduce:transition-none"
            : undefined
        }
      >
        {copiado ? "Link copiado" : "Copiar link público"}
      </Chip.Label>
    </Button>
  );
}
