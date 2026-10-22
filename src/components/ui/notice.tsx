"use client";
import { Alert } from "@heroui/react";
import type { ReactNode } from "react";
export function Notice({
  children,
  good = false,
}: {
  children: ReactNode;
  good?: boolean;
}) {
  return (
    <Alert
      status={good ? "success" : "danger"}
      role={good ? "status" : "alert"}
    >
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}
