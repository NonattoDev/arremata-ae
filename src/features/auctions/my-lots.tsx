"use client";
import { runAction } from "@/lib/run-action";
import { cancelLotAction } from "@/server/actions/lots";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@heroui/react";
import { ArrowUpRight, Plus } from "lucide-react";

import type { User } from "@/types/auction";
import type { Lot } from "@/types/auction";
import { brl } from "@/lib/format";

import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { Empty } from "@/components/ui/empty";
import { LotCard } from "@/components/auctions/lot-card";
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
    <section className="page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {user.role === "seller"
              ? "PAINEL DO LEILOEIRO"
              : "SUA COLEÇÃO DE HISTÓRIAS"}
          </span>
          <h1>
            {user.role === "seller"
              ? "Seus lotes, de perto."
              : "Meus arremates."}
          </h1>
        </div>
        {user.role === "seller" && (
          <Link href="/novo-lote" className="button-link orange-button">
            <Plus size={18} />
            Criar lote
          </Link>
        )}
      </div>
      {user.role === "seller" && (
        <p className="lead">
          Total arrematado:{" "}
          <strong>
            {brl(
              lots
                ?.filter((l) => l.hasWinner)
                .reduce((sum, l) => sum + l.currentAmount, 0) || 0,
            )}
          </strong>
        </p>
      )}
      {(error || actionError) && <Notice>{error || actionError}</Notice>}
      {!lots && !error ? (
        <Loading />
      ) : lots?.length ? (
        <div className="lot-grid">
          {lots.map((l) => (
            <div key={l.id}>
              <LotCard lot={l} />
              <div className="lot-actions">
                {l.hasWinner ? (
                  <Link href={`/comprovante/${l.id}`}>
                    {l.isLeader ? "Você arrematou! " : ""}Ver comprovante{" "}
                    <ArrowUpRight size={14} />
                  </Link>
                ) : l.status === "closed" ? (
                  <span>Encerrado sem vencedor</span>
                ) : l.isLeader ? (
                  <span className="winning">Você está ganhando</span>
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty
          title={
            user.role === "seller"
              ? "Sua primeira obra merece um palco."
              : "Sua coleção começa com um lance."
          }
        >
          {user.role === "seller"
            ? "Busque uma obra no catálogo e publique seu primeiro lote."
            : "Os lotes em que você participar aparecerão aqui."}
        </Empty>
      )}
    </section>
  );
}
