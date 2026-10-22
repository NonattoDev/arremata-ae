"use client";
import { EmptyState, Typography } from "@heroui/react";
import type { ReactNode } from "react";
export function Empty({
  title = "Ainda não há lotes por aqui.",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <EmptyState>
      <Typography.Heading level={3}>{title}</Typography.Heading>
      <Typography.Paragraph>
        {children || "Volte em breve para descobrir novas obras."}
      </Typography.Paragraph>
    </EmptyState>
  );
}
