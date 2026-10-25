"use client";

import { useState } from "react";
import { Button, Card, Typography } from "@heroui/react";
import { CampoAcesso } from "./campo-acesso";

const dominios = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "icloud.com",
];

export function CampoEmail() {
  const [email, definirEmail] = useState("");
  const [sugestoesAtivas, definirSugestoesAtivas] = useState(true);
  const partes = email.split("@");
  const sugestoes =
    sugestoesAtivas && partes.length === 2 && partes[0].trim()
      ? dominios.filter(
          (dominio) =>
            dominio.startsWith(partes[1].toLowerCase()) &&
            dominio !== partes[1].toLowerCase(),
        )
      : [];
  return (
    <Card.Content className="gap-2">
      <CampoAcesso
        name="email"
        rotulo="E-mail"
        icone="email"
        type="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        placeholder="voce@exemplo.com"
        required
        autoComplete="email"
        value={email}
        onChange={(evento) => {
          definirEmail(evento.target.value);
          definirSugestoesAtivas(true);
        }}
        onKeyDown={(evento) => {
          if (evento.key === "Escape") definirSugestoesAtivas(false);
        }}
        aria-describedby={sugestoes.length ? "sugestoes-email" : undefined}
      />
      {sugestoes.length > 0 && (
        <Card.Content
          role="group"
          aria-label="Sugestões de domínio do e-mail"
          className="gap-2"
        >
          <Typography id="sugestoes-email" className="text-xs text-muted">
            Complete o domínio
          </Typography>
          <Card.Content className="flex-row flex-wrap gap-2">
            {sugestoes.map((dominio) => (
              <Button
                key={dominio}
                type="button"
                size="sm"
                variant="secondary"
                className="min-h-11"
                aria-label={`Usar ${dominio}`}
                onPress={() => {
                  definirEmail(`${partes[0]}@${dominio}`);
                  definirSugestoesAtivas(false);
                }}
              >
                @{dominio}
              </Button>
            ))}
          </Card.Content>
        </Card.Content>
      )}
    </Card.Content>
  );
}
