"use client";
import { EmptyState, Typography } from "@heroui/react";
import type { ReactNode } from "react";
export function EstadoVazio({
  title: titulo = "Nenhum lote disponível.",
  children: filhos,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <EmptyState>
      <Typography.Heading level={3}>{titulo}</Typography.Heading>
      {filhos && <Typography.Paragraph>{filhos}</Typography.Paragraph>}
    </EmptyState>
  );
}
