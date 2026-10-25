"use client";
import { Alert } from "@heroui/react";
import type { ReactNode } from "react";
export function Aviso({
  children: filhos,
  sucesso = false,
  pulsar = false,
}: {
  children: ReactNode;
  sucesso?: boolean;
  pulsar?: boolean;
}) {
  return (
    <Alert
      status={sucesso ? "success" : "danger"}
      role={sucesso ? "status" : "alert"}
    >
      <Alert.Indicator
        className={pulsar ? "motion-safe:animate-pulse" : undefined}
      />
      <Alert.Content>
        <Alert.Description>{filhos}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
