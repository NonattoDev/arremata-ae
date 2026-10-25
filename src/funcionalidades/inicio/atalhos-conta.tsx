"use client";
import { Icone } from "@/componentes/ui/icone";

import { Card, Link, buttonVariants } from "@heroui/react";
import { useSessao } from "@/componentes/provedores/provedor-sessao";

export function AtalhosConta() {
  const { dados } = useSessao();
  const usuario = dados?.user;
  if (!usuario) return null;
  const leiloeiro = usuario?.role === "seller";
  const atalhos = [
    {
      titulo: leiloeiro ? "Seus lotes" : "Seus arremates",
      descricao: leiloeiro
        ? "Publicações, lances recebidos e resultados."
        : "Participações, resultados e comprovantes.",
      endereco: usuario ? "/meus-lotes" : "/cadastro",
      acao: usuario ? "Acessar painel" : "Criar conta",
    },
    {
      titulo: leiloeiro ? "Publicar uma obra" : "Sua carteira",
      descricao: leiloeiro
        ? "Escolha uma obra e defina as condições do lote."
        : "Saldo disponível e valores reservados em lances.",
      endereco: usuario ? (leiloeiro ? "/novo-lote" : "/carteira") : "/entrar",
      acao: leiloeiro ? "Criar lote" : "Consultar saldo",
    },
  ];
  return (
    <Card.Content className="grid gap-4 md:grid-cols-2">
      {atalhos.map((atalho) => (
        <Card
          key={atalho.endereco}
          className="flex-row flex-wrap items-center justify-between gap-4 p-6"
        >
          <Card.Header className="gap-1">
            <Card.Title className="text-lg">{atalho.titulo}</Card.Title>
            <Card.Description>{atalho.descricao}</Card.Description>
          </Card.Header>
          <Link
            href={atalho.endereco}
            className={buttonVariants({ variant: "secondary" })}
          >
            <Icone
              nome={
                atalho.endereco === "/carteira"
                  ? "carteira"
                  : atalho.endereco === "/novo-lote"
                    ? "adicionar"
                    : "seta"
              }
            />
            {atalho.acao}
          </Link>
        </Card>
      ))}
    </Card.Content>
  );
}
