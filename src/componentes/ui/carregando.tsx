"use client";
import { EmptyState, Spinner, Typography } from "@heroui/react";
export function Carregando() {
  return (
    <EmptyState role="status">
      <Spinner />
      <Typography>Carregando…</Typography>
    </EmptyState>
  );
}
