"use client";

import { useState } from "react";
import { Card, Typography } from "@heroui/react";
import { CampoAcesso } from "./campo-acesso";
import { Icone } from "@/componentes/ui/icone";

export function SenhaCadastro({
  rotulo = "Senha",
  desabilitado = false,
}: {
  rotulo?: string;
  desabilitado?: boolean;
}) {
  const [senha, definirSenha] = useState("");
  const [confirmacao, definirConfirmacao] = useState("");
  const regras = [
    { texto: "Pelo menos 12 caracteres", atendida: senha.length >= 12 },
    {
      texto: "As duas senhas devem ser iguais",
      atendida: senha.length > 0 && senha === confirmacao,
    },
  ];
  return (
    <Card.Content className="gap-3">
      <CampoAcesso
        name="password"
        rotulo={rotulo}
        disabled={desabilitado}
        icone="senha"
        type="password"
        required
        minLength={12}
        ocultarErroComprimento
        maxLength={128}
        autoComplete="new-password"
        placeholder="Crie uma senha"
        value={senha}
        onChange={(evento) => definirSenha(evento.target.value)}
        aria-describedby={senha.length > 0 ? "regras-senha" : undefined}
      />
      {senha.length > 0 && (
        <CampoAcesso
          name="confirmacaoSenha"
          disabled={desabilitado}
          rotulo="Confirmar senha"
          icone="senha"
          type="password"
          required
          maxLength={128}
          autoComplete="new-password"
          placeholder="Digite a senha novamente"
          value={confirmacao}
          onChange={(evento) => definirConfirmacao(evento.target.value)}
          aria-describedby="regras-senha"
          aria-invalid={confirmacao.length > 0 && senha !== confirmacao}
        />
      )}
      {senha.length > 0 && (
        <Card.Content
          id="regras-senha"
          className="gap-2"
          aria-label="Regras da senha"
        >
          {regras.map((regra) => (
            <Typography
              key={regra.texto}
              className={`flex items-center gap-2 text-xs ${regra.atendida ? "text-success" : "text-danger"}`}
            >
              <Icone
                nome={regra.atendida ? "confirmar" : "fechar"}
                className="text-base"
              />
              {regra.atendida ? "Atendida: " : ""}
              {regra.texto}
            </Typography>
          ))}
        </Card.Content>
      )}
    </Card.Content>
  );
}
