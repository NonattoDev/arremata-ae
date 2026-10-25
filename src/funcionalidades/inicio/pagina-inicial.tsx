"use client";

import { Icone } from "@/componentes/ui/icone";

import { Card, Link, Typography, buttonVariants } from "@heroui/react";
import { useRecurso } from "@/hooks/use-recurso";
import { CartaoLote } from "@/componentes/leiloes/cartao-lote";
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
  const destacados = aoVivo.slice(0, 3);
  return (
    <Card variant="transparent" className="gap-10 p-0 sm:gap-12">
      <DestaqueInicial lotes={aoVivo.slice(0, 5)} quantidade={aoVivo.length} />
      {dados && !erro && (
        <Card.Content className="p-0 min-[1920px]:hidden">
          <DestaquesDisputas lotes={dados} faixa />
        </Card.Content>
      )}
      <Card variant="transparent" className="gap-6 p-0">
        <Card.Header className="flex-row flex-wrap items-end justify-between gap-4">
          <Card.Content className="flex-none gap-2">
            <Typography.Heading level={2} className="text-2xl sm:text-3xl">
              Em leilão agora
            </Typography.Heading>
            <Card.Description>
              Valores e prazos atualizados durante a disputa.
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
        ) : destacados.length ? (
          <Card.Content className="relative grid min-w-0 items-start gap-6 overflow-visible">
            <Card.Content className="grid min-w-0 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {destacados.map((lote) => (
                <CartaoLote key={lote.id} lote={lote} />
              ))}
            </Card.Content>
            <Card.Content className="hidden min-w-0 p-0 min-[1920px]:absolute min-[1920px]:left-full min-[1920px]:top-0 min-[1920px]:ml-6 min-[1920px]:flex min-[1920px]:w-68">
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
