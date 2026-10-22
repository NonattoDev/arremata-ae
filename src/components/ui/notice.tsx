"use client";
import { type ReactNode } from "react";

import { Check, AlertCircle } from "lucide-react";

export function Notice({
  children,
  good = false,
}: {
  children: ReactNode;
  good?: boolean;
}) {
  return (
    <div
      className={`notice ${good ? "good" : ""}`}
      role={good ? "status" : "alert"}
    >
      {good ? <Check size={18} /> : <AlertCircle size={18} />}
      <span>{children}</span>
    </div>
  );
}
