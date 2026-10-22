"use client";
import { Button, Card, Link, Typography } from "@heroui/react";
import { runAction } from "@/lib/run-action";
import { cancelLotAction } from "@/server/actions/lots";

import { useState } from "react";

import type { User } from "@/types/auction";
import type { Lot } from "@/types/auction";
import { brl } from "@/lib/format";

import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { Empty } from "@/components/ui/empty";
import { LotCard } from "@/components/auctions/lot-card";
import { Share } from "@/components/ui/share";
export function MyLots({ user }: { user: User }) {
  const { data: lots, error, refresh } = useResource<Lot[]>("mine", true);
  const [actionError, setActionError] = useState(""),
    [busy, setBusy] = useState("");
  const cancel = async (id: string) => {
    setBusy(id);
    setActionError("");
    try {
      await runAction(() => cancelLotAction(id));
      await refresh();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy("");
    }
  };
  return (
    <Card>
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Typography>
            {user.role === "seller"
              ? "PAINEL DO LEILOEIRO"
              : "MINHAS PARTICIPAÇÕES"}
          </Typography>
          <Typography.Heading level={1}>
            {user.role === "seller" ? "Meus lotes" : "Meus arremates"}
          </Typography.Heading>
        </Card.Content>
        {user.role === "seller" && <Link href="/novo-lote">Criar lote</Link>}
      </Card.Content>
      {user.role === "seller" && (
        <Typography.Paragraph>
          Total arrematado:{" "}
          {brl(
            lots
              ?.filter((l) => l.hasWinner)
              .reduce((sum, l) => sum + l.currentAmount, 0) || 0,
          )}
        </Typography.Paragraph>
      )}
      {(error || actionError) && <Notice>{error || actionError}</Notice>}
      {!lots && !error ? (
        <Loading />
      ) : lots?.length ? (
        <Card.Content className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lots.map((l) => (
            <Card.Content key={l.id}>
              <LotCard lot={l} />
              <Card.Content className="flex min-w-0 flex-col gap-4">
                {l.hasWinner ? (
                  <>
                    <Typography>
                      {l.isLeader ? "Você arrematou por" : "Arrematado por"}{" "}
                      {brl(l.currentAmount)}
                    </Typography>
                    <Link href={`/comprovante/${l.id}`}>Ver comprovante</Link>
                    <Share path={`/comprovante/${l.id}`} />
                  </>
                ) : l.status === "closed" ? (
                  <Typography>Encerrado sem vencedor</Typography>
                ) : l.isLeader ? (
                  <Typography>Você está ganhando</Typography>
                ) : null}
                {user.role === "seller" &&
                  ["live", "scheduled"].includes(l.status) &&
                  l.bidCount === 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      isPending={busy === l.id}
                      onPress={() => cancel(l.id)}
                    >
                      Cancelar lote
                    </Button>
                  )}
              </Card.Content>
            </Card.Content>
          ))}
        </Card.Content>
      ) : (
        <Empty
          title={
            user.role === "seller"
              ? "Você ainda não publicou lotes."
              : "Você ainda não participou de leilões."
          }
        >
          {user.role === "seller"
            ? "Busque uma obra no catálogo e publique seu primeiro lote."
            : "Os lotes em que você participar aparecerão aqui."}
        </Empty>
      )}
    </Card>
  );
}
