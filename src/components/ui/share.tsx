"use client";
import { useState } from "react";
import Link from "next/link";

import { Button } from "@heroui/react";
import { Copy } from "lucide-react";

export function Share({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      onPress={async () => {
        try {
          await navigator.clipboard.writeText(
            `${window.location.origin}${path}`,
          );
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      <Copy size={16} />
      {copied ? "Link copiado" : "Copiar link público"}
    </Button>
  );
}
