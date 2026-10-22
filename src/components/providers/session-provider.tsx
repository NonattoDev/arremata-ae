"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useResource } from "@/hooks/use-resource";
import type { User } from "@/types/auction";
import { RouterProvider, I18nProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

type SessionState = ReturnType<typeof useResource<{ user: User | null }>>;
const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useResource<{ user: User | null }>("me");
  return (
    <SessionContext.Provider value={session}>
      <I18nProvider locale="pt-BR">
        <RouterProvider navigate={router.push}>{children}</RouterProvider>
      </I18nProvider>
    </SessionContext.Provider>
  );
}
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession requires SessionProvider");
  return session;
}
