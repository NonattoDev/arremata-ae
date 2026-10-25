"use client";

import { SenhaCadastro } from "./senha-cadastro";
import { esquemaConfirmacaoSenha } from "@/lib/confirmacao-senha";
import { Icone } from "@/componentes/ui/icone";
import { executarAcao } from "@/lib/executar-acao";
import { cadastrarAcao, entrarAcao } from "@/servidor/actions/autenticacao";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";
import { Button, Card, Form, Typography } from "@heroui/react";

import { Aviso } from "@/componentes/ui/aviso";
import { AlternarAcesso } from "./alternar-acesso";
import { SeletorPerfil } from "./seletor-perfil";
import { CampoEmail } from "./campo-email";
import { CampoAcesso } from "./campo-acesso";
export function FormularioAcesso({
  aoEntrar,
  cadastro = false,
}: {
  aoEntrar: () => Promise<void>;
  cadastro?: boolean;
}) {
  const [erro, definirErro] = useState(""),
    [ocupado, definirOcupado] = useState(false);
  const roteador = useRouter();
  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    definirOcupado(true);
    definirErro("");
    const valores = Object.fromEntries(new FormData(evento.currentTarget));
    try {
      if (cadastro && !esquemaConfirmacaoSenha.safeParse(valores).success) {
        throw new Error(
          "Confira as regras da senha e repita a mesma senha na confirmação.",
        );
      }
      await executarAcao(() =>
        cadastro ? cadastrarAcao(valores) : entrarAcao(valores),
      );
      await aoEntrar();
      roteador.push("/");
    } catch (evento) {
      definirErro((evento as Error).message);
    } finally {
      definirOcupado(false);
    }
  };
  return (
    <>
      <Card className="mx-auto w-full max-w-lg gap-6 p-5 sm:p-8">
        <Card.Header className="items-center gap-3 text-center">
          <Typography.Heading
            level={1}
            className="font-[family-name:var(--fonte-texto)]! text-2xl font-medium tracking-normal sm:text-3xl"
          >
            {cadastro ? "Crie sua conta" : "Acesse sua conta"}
          </Typography.Heading>
          <Card.Description>
            {cadastro
              ? "Cadastre-se como licitante ou leiloeiro."
              : "Acesse sua conta com e-mail e senha."}
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Form onSubmit={enviar} className="flex flex-col gap-4">
            {cadastro && (
              <>
                <CampoAcesso
                  name="name"
                  rotulo="Seu nome"
                  placeholder="Digite seu nome completo"
                  icone="pessoa"
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                />
                <SeletorPerfil />
              </>
            )}
            <CampoEmail />
            {cadastro ? (
              <SenhaCadastro />
            ) : (
              <CampoAcesso
                name="password"
                rotulo="Senha"
                icone="senha"
                type="password"
                minLength={12}
                maxLength={128}
                required
                autoComplete={cadastro ? "new-password" : "current-password"}
                placeholder={
                  cadastro ? "Pelo menos 12 caracteres" : "Digite sua senha"
                }
              />
            )}
            {erro && <Aviso>{erro}</Aviso>}
            <Button
              type="submit"
              size="lg"
              className="min-h-12"
              fullWidth
              isPending={ocupado}
            >
              <Icone nome={cadastro ? "cadastro" : "entrar"} />
              {cadastro ? "Criar minha conta" : "Entrar na minha conta"}
            </Button>
          </Form>
        </Card.Content>
        <AlternarAcesso cadastro={cadastro} />
      </Card>
    </>
  );
}
