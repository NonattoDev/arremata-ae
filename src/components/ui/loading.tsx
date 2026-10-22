"use client";
import { EmptyState, Spinner, Typography } from "@heroui/react";
export function Loading() {
  return (
    <EmptyState role="status">
      <Spinner />
      <Typography>Preparando tudo por aqui…</Typography>
    </EmptyState>
  );
}
