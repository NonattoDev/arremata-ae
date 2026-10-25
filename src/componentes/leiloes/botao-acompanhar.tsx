"use client";
import { Button, Chip } from "@heroui/react";
import { useAcompanhamento } from "@/componentes/provedores/provedor-acompanhamento";
import { Icone } from "@/componentes/ui/icone";

export function BotaoAcompanhar({
  id,
  compacto = false,
}: {
  id: string;
  compacto?: boolean;
}) {
  const { ids, adicionar, remover, pronto } = useAcompanhamento();
  const selecionado = ids.includes(id);
  return (
    <Button
      type="button"
      variant="secondary"
      size={compacto ? "sm" : "md"}
      className="group min-h-11 min-w-11 shrink-0 gap-0 text-accent"
      aria-pressed={selecionado}
      isDisabled={!pronto}
      aria-label={
        selecionado ? "Remover do miniplayer" : "Acompanhar no miniplayer"
      }
      onPress={() => (selecionado ? remover(id) : adicionar(id))}
    >
      <Icone nome={selecionado ? "confirmar" : "acompanhar"} />
      <Chip.Label
        className={
          compacto
            ? "max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:ml-2 group-hover:max-w-32 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-32 group-focus-visible:opacity-100 motion-reduce:transition-none"
            : "ml-2"
        }
      >
        {selecionado ? "Acompanhando" : "Acompanhar"}
      </Chip.Label>
    </Button>
  );
}
