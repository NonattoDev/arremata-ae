"use client";
import { Icone } from "@/componentes/ui/icone";
import { Button, Card, Link, Typography } from "@heroui/react";
import { executarAcao } from "@/lib/executar-acao";
import { cancelarLoteAcao } from "@/servidor/actions/lotes";

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
export function MeusLotes({ usuario }: { usuario: Usuario }) {
  const { dados: lotes, erro, atualizar } = useRecurso<Lote[]>("mine", true);
  const [erroAcao, definirErroAcao] = useState(""),
    [ocupado, definirOcupado] = useState("");
  const cancelar = async (id: string) => {
    definirOcupado(id);
    definirErroAcao("");
    try {
      await executarAcao(() => cancelarLoteAcao(id));
      await atualizar();
    } catch (evento) {
      definirErroAcao((evento as Error).message);
    } finally {
      definirOcupado("");
    }
  };
  return (
    <Card className="min-w-0 gap-6 p-5 sm:p-8">
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Typography>
            {usuario.role === "seller"
              ? "PAINEL DO LEILOEIRO"
              : "MINHAS PARTICIPAÇÕES"}
          </Typography>
          <Typography.Heading level={1}>
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
      {(erro || erroAcao) && <Aviso>{erro || erroAcao}</Aviso>}
      {!lotes && !erro ? (
        <Carregando />
      ) : lotes?.length ? (
        <Card.Content className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lotes.map((loteBanco) => (
            <Card.Content key={loteBanco.id}>
              <CartaoLote lote={loteBanco} />
              <Card.Content className="flex min-w-0 flex-col gap-4">
                {loteBanco.hasWinner ? (
                  <>
                    <Typography>
                      {loteBanco.isLeader
                        ? "Você arrematou por"
                        : "Arrematado por"}{" "}
                      {formatarReais(loteBanco.currentAmount)}
                    </Typography>
                    <Link href={`/comprovante/${loteBanco.id}`}>
                      <Icone nome="comprovante" />
                      Ver comprovante
                    </Link>
                    <Compartilhar caminho={`/comprovante/${loteBanco.id}`} />
                  </>
                ) : loteBanco.status === "closed" ? (
                  <Typography>Encerrado sem vencedor</Typography>
                ) : loteBanco.isLeader ? (
                  <Typography>Você está ganhando</Typography>
                ) : null}
                {usuario.role === "seller" &&
                  ["live", "scheduled"].includes(loteBanco.status) &&
                  loteBanco.bidCount === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      isPending={ocupado === loteBanco.id}
                      onPress={() => cancelar(loteBanco.id)}
                    >
                      <Icone nome="cancelar" />
                      Cancelar lote
                    </Button>
                  )}
              </Card.Content>
            </Card.Content>
          ))}
        </Card.Content>
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
