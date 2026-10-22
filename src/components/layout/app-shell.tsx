"use client";
import { runAction } from "@/lib/run-action";
import { logoutAction } from "@/server/actions/auth";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { Button, Card, Link, Typography, Separator } from "@heroui/react";

import type { ReactNode } from "react";
import { useSession } from "@/components/providers/session-provider";
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname(),
    router = useRouter();
  const auth = useSession();
  const user = auth.data?.user || null;
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem("theme") === "dark";
    setDark(value);
    document.documentElement.classList.toggle("dark", value);
  }, []);
  useEffect(() => {
    void auth.refresh();
  }, [path]); // Re-read cookie-backed identity after navigation.
  const logout = async () => {
    await runAction(() => logoutAction());
    await auth.refresh();
    router.push("/");
  };
  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark", !dark);
    localStorage.setItem("theme", dark ? "light" : "dark");
  };
  return (
    <Card className="mx-auto my-4 w-full max-w-7xl sm:my-8">
      <Card.Header>
        <Link href="/" aria-label="Arremata aê, início">
          <Typography.Heading level={2}>Arremata aê</Typography.Heading>
        </Link>
        <Card.Description>
          Obras com história. Lances com transparência.
        </Card.Description>
      </Card.Header>
      <Card.Content
        role="navigation"
        aria-label="Navegação principal"
        className="flex flex-row flex-wrap items-center gap-4"
      >
        <Link href="/">Explorar leilões</Link>
        {user && (
          <>
            <Link href="/meus-lotes">
              {user.role === "seller"
                ? "Painel do leiloeiro"
                : "Meus arremates"}
            </Link>
            <Link href="/carteira">
              {user.role === "seller" ? "Recebimentos" : "Minha carteira"}
            </Link>
          </>
        )}
      </Card.Content>
      <Card.Footer className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onPress={toggleTheme}>
          {dark ? "Ativar tema claro" : "Ativar tema escuro"}
        </Button>
        {user ? (
          <>
            <Typography>Olá, {user.name.split(" ")[0]}</Typography>
            <Button variant="ghost" onPress={logout}>
              Sair
            </Button>
          </>
        ) : (
          <Link href="/entrar">Entrar</Link>
        )}
      </Card.Footer>
      <Separator />
      <Card.Content role="main" className="min-w-0 py-4">
        {children}
      </Card.Content>
      <Separator />
      <Card.Footer className="flex flex-wrap items-center gap-3">
        <Typography.Paragraph size="sm">
          Projeto demonstrativo · Sem dinheiro ou vendas reais.
        </Typography.Paragraph>
      </Card.Footer>
    </Card>
  );
}
