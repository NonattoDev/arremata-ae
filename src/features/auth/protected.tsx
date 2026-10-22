"use client";
import { type ReactNode } from "react";

import type { User } from "@/types/auction";
import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { Card, Link, Typography } from "@heroui/react";
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
      <Card className="mx-auto w-full max-w-lg">
        <Typography.Heading level={1}>Entre para continuar.</Typography.Heading>
        <Typography.Paragraph>
          Sua carteira e seus lances ficam na sua conta.
        </Typography.Paragraph>
        <Link href="/entrar">Entrar na minha conta</Link>
      </Card>
    );
  return children;
}
