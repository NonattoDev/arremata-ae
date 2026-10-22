"use client";
import { EmptyState, Typography } from "@heroui/react";
import type { ReactNode } from "react";
export function Empty({
  title = "Nenhum lote disponível.",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <EmptyState>
      <Typography.Heading level={3}>{title}</Typography.Heading>
      {children && <Typography.Paragraph>{children}</Typography.Paragraph>}
    </EmptyState>
  );
}
