"use client";
import { Icone } from "@/componentes/ui/icone";
import { Button, Card, Chip, Link, Typography } from "@heroui/react";
import { CancelarLote } from "@/componentes/leiloes/cancelar-lote";

import { useState } from "react";

import type { Usuario } from "@/tipos/leilao";
import type { Lote } from "@/tipos/leilao";
import { formatarReais } from "@/lib/formatacao";

import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";
import { EstadoVazio } from "@/componentes/ui/estado-vazio";
import { CartaoLote } from "@/componentes/leiloes/cartao-lote";
import { Compartilhar } from "@/componentes/ui/compartilhar";
import { IndicadorLideranca } from "@/componentes/leiloes/indicador-lideranca";
import {
  FiltrosMeusLotes,
  filtrosIniciais,
  filtrarParticipacoes,
} from "./filtros-meus-lotes";
export function MeusLotes({ usuario }: { usuario: Usuario }) {
  const { dados: lotes, erro, atualizar } = useRecurso<Lote[]>("mine", true);
  const [filtros, definirFiltros] = useState(filtrosIniciais);
  const filtrados = filtrarParticipacoes(lotes ?? [], filtros);
  return (
    <Card className="min-w-0 gap-6 p-5 sm:p-8">
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Card.Content className="flex min-w-0 flex-col gap-1">
          <Typography className="text-xs font-normal leading-relaxed text-muted">
            {usuario.role === "seller"
              ? "Painel do leiloeiro"
              : "Minhas participações"}
          </Typography>
          <Typography.Heading
            level={1}
            className="flex items-center gap-3 text-2xl font-medium sm:text-3xl"
          >
            <Icone nome="comprovante" className="text-accent" />
            {usuario.role === "seller" ? "Meus lotes" : "Meus arremates"}
          </Typography.Heading>
        </Card.Content>
        {usuario.role === "seller" && (
          <Link href="/novo-lote">
            <Icone nome="adicionar" />
            Criar lote
          </Link>
        )}
      </Card.Content>
      {usuario.role === "seller" && (
        <Typography.Paragraph>
          Total arrematado:{" "}
          {formatarReais(
            lotes
              ?.filter((loteBanco) => loteBanco.hasWinner)
              .reduce((sum, loteBanco) => sum + loteBanco.currentAmount, 0) ||
              0,
          )}
        </Typography.Paragraph>
      )}
      {erro && <Aviso>{erro}</Aviso>}
      {!!lotes?.length && (
        <>
          <FiltrosMeusLotes
            filtros={filtros}
            aoMudar={definirFiltros}
            leiloeiro={usuario.role === "seller"}
          />
          <Typography className="text-sm text-muted" aria-live="polite">
            {filtrados.length} de {lotes.length} lotes
          </Typography>
        </>
      )}
      {!lotes && !erro ? (
        <Carregando />
      ) : filtrados.length ? (
        <Card.Content className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((loteBanco) => (
            <CartaoLote key={loteBanco.id} lote={loteBanco}>
              <Card.Content className="flex min-w-0 flex-row flex-wrap items-center justify-between gap-3">
                {loteBanco.hasWinner ? (
                  <>
                    <Link
                      href={`/comprovante/${loteBanco.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 no-underline! transition-colors hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50"
                    >
                      <Icone nome="comprovante" className="text-[16px]!" />
                      Ver comprovante
                    </Link>
                    <Compartilhar
                      compacto
                      caminho={`/comprovante/${loteBanco.id}`}
                    />
                  </>
                ) : loteBanco.status === "closed" ? (
                  <Chip variant="soft" size="sm">
                    <Icone nome="informacao" />
                    Encerrado sem vencedor
                  </Chip>
                ) : loteBanco.isLeader ? (
                  <IndicadorLideranca />
                ) : null}
                {usuario.role === "seller" &&
                  ["live", "scheduled"].includes(loteBanco.status) && (
                    <CancelarLote lote={loteBanco} aoCancelar={atualizar} />
                  )}
              </Card.Content>
            </CartaoLote>
          ))}
        </Card.Content>
      ) : lotes?.length ? (
        <EstadoVazio title="Nenhum lote com esses filtros.">
          <Button
            variant="secondary"
            onPress={() => definirFiltros(filtrosIniciais)}
          >
            Limpar filtros
          </Button>
        </EstadoVazio>
      ) : (
        <EstadoVazio
          title={
            usuario.role === "seller"
              ? "Você ainda não publicou lotes."
              : "Você ainda não participou de leilões."
          }
        >
          {usuario.role === "seller"
            ? "Busque uma obra no catálogo e publique seu primeiro lote."
            : "Os lotes em que você participar aparecerão aqui."}
        </EstadoVazio>
      )}
    </Card>
  );
}
