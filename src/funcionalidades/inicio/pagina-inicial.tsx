"use client";

import { Icone } from "@/componentes/ui/icone";

import { Card, Link, Typography, buttonVariants } from "@heroui/react";
import { useRecurso } from "@/hooks/use-recurso";
import { CarrosselDisputas } from "./carrossel-disputas";
import { Carregando } from "@/componentes/ui/carregando";
import { Aviso } from "@/componentes/ui/aviso";
import { EstadoVazio } from "@/componentes/ui/estado-vazio";
import { DestaqueInicial } from "./destaque-inicial";
import { AtalhosConta } from "./atalhos-conta";
import { DestaquesDisputas } from "./destaques-disputas";
import type { Lote } from "@/tipos/leilao";

export function PaginaInicial() {
  const { dados, erro } = useRecurso<Lote[]>("lots", true);
  const aoVivo = dados?.filter((lote) => lote.status === "live") ?? [];

  return (
    <Card variant="transparent" className="gap-10 p-0 sm:gap-12">
      <DestaqueInicial lotes={aoVivo.slice(0, 5)} quantidade={aoVivo.length} />
      {dados && !erro && (
        <Card.Content className="p-0 min-[2300px]:hidden">
          <DestaquesDisputas lotes={dados} faixa />
        </Card.Content>
      )}
      <Card variant="transparent" className="gap-6 p-0">
        <Card.Header className="flex-row flex-wrap items-end justify-between gap-4">
          <Card.Content className="min-w-0 w-full gap-2 sm:w-auto sm:flex-1">
            <Typography.Heading
              level={2}
              className="flex items-center gap-3 text-2xl sm:text-3xl"
            >
              <Icone nome="leilao" className="text-accent" />
              Em leilão agora
            </Typography.Heading>
            <Card.Description>
              Os mais disputados primeiro. Explore os destaques ou veja todos no catálogo.
            </Card.Description>
          </Card.Content>
          <Link
            href="/leiloes"
            className={buttonVariants({ variant: "secondary" })}
          >
            Ver catálogo completo <Icone nome="seta" />
          </Link>
        </Card.Header>
        {erro ? (
          <Aviso>{erro}</Aviso>
        ) : !dados ? (
          <Carregando />
        ) : aoVivo.length ? (
          <Card.Content className="relative grid min-w-0 items-start gap-6 overflow-visible">
            <CarrosselDisputas lotes={aoVivo} />
            <Card.Content className="hidden min-w-0 p-0 min-[2300px]:absolute min-[2300px]:left-full min-[2300px]:top-0 min-[2300px]:ml-6 min-[2300px]:flex min-[2300px]:w-68">
              <DestaquesDisputas lotes={dados} />
            </Card.Content>
          </Card.Content>
        ) : (
          <EstadoVazio title="Nenhum leilão ao vivo no momento.">
            <Link href="/leiloes">
              <Icone nome="leilao" />
              Consultar próximos leilões
            </Link>
          </EstadoVazio>
        )}
      </Card>
      <AtalhosConta />
    </Card>
  );
}
