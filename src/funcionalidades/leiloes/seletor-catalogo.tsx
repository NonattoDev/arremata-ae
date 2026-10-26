"use client";

import {
  Card,
  Chip,
  Dropdown,
  Typography,
  buttonVariants,
} from "@heroui/react";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";

export function SeletorCatalogo({
  rotulo,
  icone,
  valor,
  opcoes,
  aoSelecionar,
}: {
  rotulo: string;
  icone: NomeIcone;
  valor: string;
  opcoes: { valor: string; rotulo: string }[];
  aoSelecionar: (valor: string) => void;
}) {
  const selecionado =
    opcoes.find((opcao) => opcao.valor === valor)?.rotulo ?? rotulo;
  return (
    <Card.Content className="min-w-0 gap-2 p-0">
      <Typography className="text-sm font-medium">{rotulo}</Typography>
      <Dropdown>
        <Dropdown.Trigger
          aria-label={`${rotulo}: ${selecionado}`}
          className={`${buttonVariants({ variant: "secondary" })} grid! min-h-12 w-full! grid-cols-[20px_minmax(0,1fr)_20px] items-center gap-3! rounded-xl border! border-slate-300! bg-white! px-4 text-left shadow-sm transition-colors hover:border-blue-400! hover:bg-blue-50! focus-visible:border-blue-500! dark:border-slate-600! dark:bg-slate-900! dark:hover:border-blue-400! dark:hover:bg-slate-800!`}
        >
          <Icone
            nome={icone}
            className="flex h-5 w-5 items-center justify-center"
          />
          <Chip.Label className="min-w-0 truncate text-left">
            {selecionado}
          </Chip.Label>
          <Icone
            nome="expandir"
            className="flex h-5 w-5 items-center justify-center"
          />
        </Dropdown.Trigger>
        <Dropdown.Popover
          placement="bottom start"
          className="max-h-80 max-w-[calc(100vw-2rem)] overflow-y-auto"
        >
          <Dropdown.Menu
            aria-label={rotulo}
            selectionMode="single"
            selectedKeys={[valor]}
            onAction={(chave) => aoSelecionar(String(chave))}
          >
            {opcoes.map((opcao) => (
              <Dropdown.Item
                key={opcao.valor}
                id={opcao.valor}
                textValue={opcao.rotulo}
              >
                {opcao.rotulo}
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </Card.Content>
  );
}
