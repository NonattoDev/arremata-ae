"use client";
import { runAction } from "@/lib/run-action";
import { logoutAction } from "@/server/actions/auth";

import { useEffect, useState } from "react";

import { usePathname, useRouter } from "next/navigation";
import { Card } from "@heroui/react";

import type { ReactNode } from "react";
import { useSession } from "@/components/providers/session-provider";
import { RouteBreadcrumbs } from "@/components/layout/route-breadcrumbs";
import { SiteNavbar } from "@/components/layout/site-navbar";
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
    <>
      <SiteNavbar
        user={user}
        dark={dark}
        onToggleTheme={toggleTheme}
        onLogout={logout}
      />
      <Card
        variant="transparent"
        role="main"
        className="mx-auto my-6 w-[calc(100%-1.5rem)] max-w-7xl min-w-0 p-0 sm:my-8 sm:w-[calc(100%-3rem)]"
      >
        <Card.Content className="min-w-0">
          <RouteBreadcrumbs />
          {children}
        </Card.Content>
      </Card>
    </>
  );
}
