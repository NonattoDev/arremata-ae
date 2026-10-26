"use client";

import Image from "next/image";
import {
  Card,
  Checkbox,
  FieldError,
  Input,
  Label,
  TextField,
  Typography,
} from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import {
  errosContatosNovidades,
  type PreferenciasNovidades,
} from "@/lib/preferencias-novidades";

const canais = [
  { chave: "whatsapp", nome: "WhatsApp" },
  { chave: "telegram", nome: "Telegram" },
  { chave: "email", nome: "E-mail" },
] as const;

export function CanaisNovidades({
  preferencias,
  aoAlterar,
  desabilitado,
  mostrarErros,
}: {
  preferencias: PreferenciasNovidades;
  aoAlterar: (valor: PreferenciasNovidades) => void;
  desabilitado: boolean;
  mostrarErros: boolean;
}) {
  const erros = errosContatosNovidades(preferencias);
  return (
    <Card.Content
      role="group"
      aria-label="Canais de novidades"
      className="gap-3 p-0"
    >
      {canais.map(({ chave, nome }) => {
        const campo =
          chave === "whatsapp" ? "numeroWhatsapp" : "usuarioTelegram";
        const erro = mostrarErros ? erros[campo] : "";
        return (
          <Card
            key={chave}
            variant="transparent"
            className="min-w-0 gap-3 rounded-2xl border border-border p-4"
          >
            <Checkbox
              isSelected={preferencias[chave]}
              isDisabled={desabilitado}
              onChange={(marcado) =>
                aoAlterar({ ...preferencias, [chave]: marcado })
              }
              className="flex! w-full flex-row! items-center gap-3"
            >
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Content className="flex! flex-row! items-center gap-3">
                {chave === "email" ? (
                  <Icone nome="email" className="text-accent" />
                ) : (
                  <Image
                    src={`/icones/${chave}.svg`}
                    width={22}
                    height={22}
                    alt=""
                    className="h-6 w-6 shrink-0"
                  />
                )}
                <Label className="text-sm font-medium">{nome}</Label>
              </Checkbox.Content>
            </Checkbox>
            {preferencias[chave] && chave !== "email" && (
              <TextField
                value={preferencias[campo]}
                onChange={(valor) =>
                  aoAlterar({ ...preferencias, [campo]: valor })
                }
                isRequired
                isDisabled={desabilitado}
                isInvalid={!!erro}
                className="min-w-0 w-full"
              >
                <Label className="text-xs">
                  {chave === "whatsapp"
                    ? "Número com DDI"
                    : "Usuário do Telegram"}
                </Label>
                <Input
                  type={chave === "whatsapp" ? "tel" : "text"}
                  inputMode={chave === "whatsapp" ? "tel" : "text"}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={chave === "whatsapp" ? 40 : 33}
                  placeholder={
                    chave === "whatsapp" ? "+55 71 99999-9999" : "@seu_usuario"
                  }
                  className="min-h-12 w-full min-w-0"
                />
                {erro ? (
                  <FieldError className="text-xs">{erro}</FieldError>
                ) : (
                  <Typography slot="description" className="text-xs text-muted">
                    {chave === "whatsapp"
                      ? "Inclua o código do país e o DDD."
                      : "Informe seu usuário público, sem o link t.me."}
                  </Typography>
                )}
              </TextField>
            )}
            {preferencias[chave] && chave === "email" && (
              <Typography className="text-xs text-muted">
                Será usado o e-mail da sua conta.
              </Typography>
            )}
          </Card>
        );
      })}
    </Card.Content>
  );
}
