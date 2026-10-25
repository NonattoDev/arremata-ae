"use client";
import { useState, useTransition, type FormEvent } from "react";
import { Button, Card, Form, Typography } from "@heroui/react";
import { CampoAcesso } from "@/funcionalidades/autenticacao/campo-acesso";
import { SenhaCadastro } from "@/funcionalidades/autenticacao/senha-cadastro";
import { alterarSenhaAcao } from "@/servidor/actions/perfil";
import { Icone } from "@/componentes/ui/icone";

export function TrocaSenha() {
  const [mensagem, informar] = useState("");
  const [versao, reiniciar] = useState(0);
  const [salvando, iniciar] = useTransition();
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const entrada = Object.fromEntries(new FormData(evento.currentTarget));
    informar("");
    iniciar(async () => {
      try {
        const resultado = await alterarSenhaAcao(entrada);
        if (!resultado.success) {
          informar(resultado.error);
          return;
        }
        reiniciar((atual) => atual + 1);
        informar("Senha alterada. As outras sessões foram encerradas.");
      } catch {
        informar("Não foi possível alterar a senha. Tente novamente.");
      }
    });
  }
  return (
    <Card.Content className="gap-4">
      <Card.Title>Alterar senha</Card.Title>
      <Card.Description>
        Confirme sua senha atual. Ao salvar, sua conta será desconectada nos
        outros dispositivos.
      </Card.Description>
      <Form key={versao} onSubmit={salvar} className="flex flex-col gap-4">
        <CampoAcesso
          name="senhaAtual"
          rotulo="Senha atual"
          icone="senha"
          type="password"
          required
          maxLength={128}
          autoComplete="current-password"
          placeholder="Digite sua senha atual"
          disabled={salvando}
        />
        <SenhaCadastro rotulo="Nova senha" desabilitado={salvando} />
        <Button type="submit" isPending={salvando}>
          <Icone nome="seguranca" /> Alterar senha
        </Button>
      </Form>
      <Typography role="status" className="text-sm">
        {mensagem}
      </Typography>
    </Card.Content>
  );
}
