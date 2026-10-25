"use client";
import { useState, useTransition, type FormEvent } from "react";
import { Button, Card, Form, Typography } from "@heroui/react";
import type { Usuario } from "@/tipos/leilao";
import { CampoAcesso } from "@/funcionalidades/autenticacao/campo-acesso";
import { CampoCpf } from "@/componentes/ui/campo-cpf";
import { salvarDadosPerfilAcao } from "@/servidor/actions/perfil";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
import { formatarCpf, validarCpf } from "@/lib/cpf";
import { Icone } from "@/componentes/ui/icone";
export function DadosPerfil({ usuario }: { usuario: Usuario }) {
  const [nome, definirNome] = useState(usuario.name);
  const [cpf, definirCpf] = useState("");
  const [erroCpf, definirErroCpf] = useState("");
  const [tentativa, definirTentativa] = useState(0);
  const [mensagem, informar] = useState("");
  const [salvando, iniciar] = useTransition();
  const sessao = useSessao();
  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    informar("");
    if (!usuario.cpf && cpf && !validarCpf(cpf)) {
      definirErroCpf("Informe um CPF válido.");
      definirTentativa((valor) => valor + 1);
      return;
    }
    iniciar(async () => {
      try {
        const resultado = await salvarDadosPerfilAcao({
          nome,
          cpf: usuario.cpf ? undefined : cpf || undefined,
        });
        if (!resultado.success) {
          informar(resultado.error);
          return;
        }
        await sessao.atualizar();
        informar("Dados salvos!");
      } catch {
        informar("Não foi possível salvar. Tente novamente.");
      }
    });
  }
  return (
    <Form onSubmit={salvar} className="flex w-full flex-col gap-5">
      <CampoAcesso
        name="nome"
        rotulo="Seu nome"
        icone="pessoa"
        value={nome}
        onChange={(evento) => definirNome(evento.target.value)}
        required
        minLength={2}
        maxLength={80}
        autoComplete="name"
        disabled={salvando}
      />
      <Card variant="secondary" className="gap-4 p-4">
        <Card.Title>Dados da conta</Card.Title>
        {[
          ["E-mail", usuario.email],
          [
            "Tipo de conta",
            usuario.role === "seller" ? "Leiloeiro" : "Licitante",
          ],
          ...(usuario.cpf ? [["CPF", formatarCpf(usuario.cpf)]] : []),
        ].map(([rotulo, valor]) => (
          <Card.Content key={rotulo} className="gap-1">
            <Typography className="text-xs text-muted">{rotulo}</Typography>
            <Typography className="break-all text-sm">{valor}</Typography>
          </Card.Content>
        ))}
        {!usuario.cpf && (
          <Card.Content className="gap-2">
            <CampoCpf
              valor={cpf}
              aoAlterar={(valor) => {
                definirCpf(valor);
                definirErroCpf("");
                informar("");
              }}
              erro={erroCpf}
              tentativa={tentativa}
              desabilitado={salvando}
            />
            <Typography className="text-xs text-muted">
              Confira antes de salvar. Depois, alterações somente pelo suporte.
            </Typography>
          </Card.Content>
        )}
        <Card.Description className="flex items-start gap-2">
          <Icone nome="seguranca" />
          Para corrigir e-mail, CPF ou tipo de conta, entre em contato com o
          suporte.
        </Card.Description>
      </Card>
      <Typography role="status" className="text-sm">
        {mensagem}
      </Typography>
      <Button type="submit" isPending={salvando}>
        <Icone nome="confirmar" />
        Salvar
      </Button>
    </Form>
  );
}
