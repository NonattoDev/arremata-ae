"use client";
import { Dropdown, Label } from "@heroui/react";
import type { Usuario } from "@/tipos/leilao";
import { AvatarUsuario } from "@/componentes/ui/avatar-usuario";
import { Icone } from "@/componentes/ui/icone";

export function MenuUsuario({
  usuario,
  aoSair,
}: {
  usuario: Usuario;
  aoSair: () => Promise<void>;
}) {
  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`Abrir menu da conta de ${usuario.name}`}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-full"
      >
        <AvatarUsuario nome={usuario.name} avatar={usuario.avatar} />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label="Minha conta">
          <Dropdown.Section>
            <Label>{usuario.name}</Label>
            <Dropdown.Item id="configuracoes" href="/configuracoes">
              <Icone nome="pessoa" /> Configurações
            </Dropdown.Item>
            <Dropdown.Item id="sair" onAction={aoSair}>
              <Icone nome="sair" /> Sair
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
