"use client";

import { Spinner } from "@heroui/react";

export function Loading() {
  return (
    <div className="loading">
      <Spinner />
      <span>Preparando tudo por aqui…</span>
    </div>
  );
}
