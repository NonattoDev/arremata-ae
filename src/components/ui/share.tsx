"use client";
import { useState } from "react";

import { Button } from "@heroui/react";

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
      {copied ? "Link copiado" : "Copiar link público"}
    </Button>
  );
}
