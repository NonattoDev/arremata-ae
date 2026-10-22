"use client";

import { Button, Card, Link } from "@heroui/react";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/layout/brand";
import type { User } from "@/types/auction";

type SiteNavbarProps = {
  user: User | null;
  dark: boolean;
  onToggleTheme: () => void;
  onLogout: () => Promise<void>;
};

export function SiteNavbar({
  user,
  dark,
  onToggleTheme,
  onLogout,
}: SiteNavbarProps) {
  const path = usePathname();
  const links = [
    { href: "/", label: "Início", active: path === "/" },
    {
      href: "/leiloes",
      label: "Leilões",
      active: path === "/leiloes" || path.startsWith("/lotes/"),
    },
    ...(user
      ? [
          {
            href: "/meus-lotes",
            label: user.role === "seller" ? "Meus lotes" : "Meus arremates",
            active: path === "/meus-lotes" || path === "/novo-lote",
          },
          {
            href: "/carteira",
            label: user.role === "seller" ? "Recebimentos" : "Carteira",
            active: path === "/carteira",
          },
        ]
      : []),
  ];

  return (
    <Card
      aria-label="Cabeçalho do site"
      className="sticky top-3 z-40 mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-7xl flex-row flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-3xl border border-border/50 bg-surface/80 px-4 py-3 shadow-lg backdrop-blur-xl sm:top-5 sm:mt-5 sm:w-[calc(100%-3rem)] sm:px-6"
    >
      <Brand />
      <Card.Content
        role="navigation"
        aria-label="Navegação principal"
        className="order-3 w-full flex-none flex-row flex-wrap items-center justify-center gap-1 lg:order-none lg:w-auto"
      >
        {links.map(({ href, label, active }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3 py-2 ${active ? "bg-surface-secondary" : ""}`}
          >
            {label}
          </Link>
        ))}
      </Card.Content>
      <Card.Footer className="gap-2">
        <Button
          variant="secondary"
          size="sm"
          isIconOnly
          aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
          onPress={onToggleTheme}
        >
          {dark ? "☀" : "☾"}
        </Button>
        {user ? (
          <Button variant="ghost" size="sm" onPress={onLogout}>
            Sair
          </Button>
        ) : (
          <>
            <Link href="/entrar">Entrar</Link>
            <Link href="/cadastro" className="hidden sm:inline-flex">
              Criar conta
            </Link>
          </>
        )}
      </Card.Footer>
    </Card>
  );
}

