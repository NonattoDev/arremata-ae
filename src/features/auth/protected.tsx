"use client";
import { type ReactNode } from "react";
import Link from "next/link";

import { ArrowRight } from "lucide-react";

import type { User } from "@/types/auction";
import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
export function Protected({
  auth,
  children,
}: {
  auth: ReturnType<typeof useResource<{ user: User | null }>>;
  children: ReactNode;
}) {
  if (auth.error) return <Notice>{auth.error}</Notice>;
  if (!auth.data) return <Loading />;
  if (!auth.data.user)
    return (
      <section className="page narrow">
        <h1>Entre para continuar.</h1>
        <p>Sua carteira e seus lances ficam na sua conta.</p>
        <Link className="button-link dark-button" href="/entrar">
          Entrar na minha conta <ArrowRight size={18} />
        </Link>
      </section>
    );
  return children;
}
