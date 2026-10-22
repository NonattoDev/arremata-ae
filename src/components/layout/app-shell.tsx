"use client";
import { runAction } from "@/lib/run-action";
import { logoutAction } from "@/server/actions/auth";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ArrowUpRight, LogOut, Menu, X, Sun, Moon } from "lucide-react";

import type { ReactNode } from "react";
import { useSession } from "@/components/providers/session-provider";
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname(),
    router = useRouter();
  const auth = useSession();
  const user = auth.data?.user || null;
  const [menu, setMenu] = useState(false),
    [dark, setDark] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem("theme") === "dark";
    setDark(value);
    document.documentElement.classList.toggle("dark", value);
  }, []);
  useEffect(() => {
    setMenu(false);
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
    <>
      <div className="announcement">
        <span className="live-dot" /> Uma nova história começa com um lance.
        <span className="announcement-right">
          Arte em domínio público · Experiência demonstrativa
        </span>
      </div>
      <header className="header">
        <Link href="/" className="brand" aria-label="Arremata aê, início">
          arremata
          <span>
            aê<small>↗</small>
          </span>
        </Link>
        <nav
          className={menu ? "nav open" : "nav"}
          aria-label="Navegação principal"
        >
          <Link className={path === "/" ? "active" : ""} href="/">
            Explorar leilões
          </Link>
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
        </nav>
        <div className="header-actions">
          <Button
            variant="ghost"
            isIconOnly
            aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
            onPress={toggleTheme}
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </Button>
          {user ? (
            <>
              <span className="user-name">Olá, {user.name.split(" ")[0]}</span>
              <Button
                variant="ghost"
                isIconOnly
                aria-label="Sair"
                onPress={logout}
              >
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <Link className="button-link dark-button" href="/entrar">
              Entrar <ArrowUpRight size={16} />
            </Link>
          )}
          <Button
            className="menu-toggle"
            variant="ghost"
            isIconOnly
            aria-label="Abrir menu"
            onPress={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
      <main>{children}</main>
      <footer>
        <Link href="/" className="brand small">
          arremata<span>aê</span>
        </Link>
        <p>Obras com história. Lances com transparência.</p>
        <span>Projeto demonstrativo · Sem dinheiro ou vendas reais.</span>
      </footer>
    </>
  );
}
