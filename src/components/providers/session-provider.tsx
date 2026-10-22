"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useResource } from "@/hooks/use-resource";
import type { User } from "@/types/auction";

type SessionState = ReturnType<typeof useResource<{ user: User | null }>>;
const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useResource<{ user: User | null }>("me");
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession requires SessionProvider");
  return session;
}
