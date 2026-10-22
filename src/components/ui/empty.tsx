"use client";
import { type ReactNode } from "react";

import { Gavel } from "lucide-react";

export function Empty({
  title = "Ainda não há lotes por aqui.",
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Gavel size={32} />
      <h3>{title}</h3>
      <p>{children || "Volte em breve para descobrir novas obras."}</p>
    </div>
  );
}
