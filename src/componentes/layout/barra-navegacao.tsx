"use client";
import { Icone } from "@/componentes/ui/icone";

import { Button, Card, Dropdown, Link, buttonVariants } from "@heroui/react";
import { usePathname } from "next/navigation";
import { AtalhoNavegacao, coresIconesNavegacao } from "@/componentes/layout/atalho-navegacao";
import { Marca } from "@/componentes/layout/marca";
import { MenuUsuario } from "@/componentes/layout/menu-usuario";
import type { Usuario } from "@/tipos/leilao";

type PropriedadesBarraNavegacao = {
  usuario: Usuario | null;
  escuro: boolean;
  aoAlternarTema: () => void;
  aoSair: () => Promise<void>;
};

export function BarraNavegacao({
  usuario,
  escuro,
  aoAlternarTema,
  aoSair,
}: PropriedadesBarraNavegacao) {
  const caminho = usePathname();
  const atalhos = [
    { href: "/", label: "Início", active: caminho === "/" },
    {
      href: "/leiloes",
      label: "Leilões",
      active: caminho === "/leiloes" || caminho.startsWith("/lotes/"),
    },
    ...(usuario
      ? [
          {
            href: "/meus-lotes",
            label: usuario.role === "seller" ? "Meus lotes" : "Meus arremates",
            active: caminho === "/meus-lotes" || caminho === "/novo-lote",
          },
          {
            href: "/carteira",
            label: usuario.role === "seller" ? "Recebimentos" : "Carteira",
            active: caminho === "/carteira",
          },
        ]
      : []),
  ];

  return (
    <Card
      aria-label="Cabeçalho do site"
      className="sticky top-3 z-40 mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-[1600px] flex-row flex-wrap items-center justify-between gap-x-2 gap-y-3 sm:gap-x-5 rounded-3xl border border-border/50 bg-surface/80 px-4 py-3 shadow-lg backdrop-blur-xl sm:top-5 sm:mt-5 sm:w-[calc(100%-3rem)] sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]"
    >
      <Marca />
      <Card.Content
        role="navigation"
        aria-label="Navegação principal"
        className="hidden flex-none flex-row items-center justify-center gap-1 lg:flex"
      >
        {atalhos.map(({ href, label: rotulo, active }) => (
          <AtalhoNavegacao
            key={href}
            href={href}
            rotulo={rotulo}
            ativo={active}
            icone={
              href === "/"
                ? "inicio"
                : href === "/leiloes"
                  ? "leilao"
                  : href === "/carteira"
                    ? "carteira"
                    : "comprovante"
            }
          />
        ))}
      </Card.Content>
      <Card.Footer className="w-auto items-center justify-end gap-2 lg:justify-self-end">
        <Dropdown>
          <Dropdown.Trigger
            className={`${buttonVariants({ variant: "secondary" })} lg:hidden`}
            aria-label="Abrir menu de navegação"
          >
            <Icone nome="menu" />
          </Dropdown.Trigger>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu aria-label="Navegação mobile">
              {atalhos.map((atalho) => (
                <Dropdown.Item
                  key={atalho.href}
                  id={atalho.href}
                  href={atalho.href}
                >
                  <Icone
                    className={coresIconesNavegacao[atalho.href === "/" ? "inicio" : atalho.href === "/leiloes" ? "leilao" : atalho.href === "/carteira" ? "carteira" : "comprovante"]}
                    nome={
                      atalho.href === "/"
                        ? "inicio"
                        : atalho.href === "/leiloes"
                          ? "leilao"
                          : atalho.href === "/carteira"
                            ? "carteira"
                            : "comprovante"
                    }
                  />
                  {atalho.label}
                </Dropdown.Item>
              ))}
              {!usuario && (
                <Dropdown.Item id="entrar" href="/entrar">
                  <Icone nome="entrar" /> Participar
                </Dropdown.Item>
              )}
              <Dropdown.Item id="tema" onAction={aoAlternarTema}>
                <Icone nome={escuro ? "claro" : "escuro"} />
                {escuro ? "Ativar tema claro" : "Ativar tema escuro"}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
        <Button
          className="hidden lg:inline-flex"
          variant="secondary"
          size="sm"
          isIconOnly
          aria-label={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
          onPress={aoAlternarTema}
        >
          <Icone nome={escuro ? "claro" : "escuro"} />
        </Button>
        {usuario ? (
          <MenuUsuario usuario={usuario} aoSair={aoSair} />
        ) : (
          <Link
            href="/entrar"
            className={buttonVariants({
              variant: "primary",
              className:
                "hidden items-center gap-2 no-underline! transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none lg:inline-flex",
            })}
          >
            <Icone nome="entrar" /> Participar
          </Link>
        )}
      </Card.Footer>
    </Card>
  );
}
