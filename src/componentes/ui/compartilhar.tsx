"use client";
import { Icone } from "@/componentes/ui/icone";
import { useState } from "react";

import { Button } from "@heroui/react";

export function Compartilhar({ caminho }: { caminho: string }) {
  const [copiado, definirCopiado] = useState(false);
  return (
    <Button
      variant="outline"
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
      <Icone nome="copiar" />
      {copiado ? "Link copiado" : "Copiar link público"}
    </Button>
  );
}
