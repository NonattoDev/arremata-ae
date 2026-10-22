"use client";
import { ArtworkImage } from "@/components/auctions/artwork-image";
import { Button, Card, Form, Link, Typography } from "@heroui/react";
import { useSession } from "@/components/providers/session-provider";
import { runAction } from "@/lib/run-action";
import { placeBidAction } from "@/server/actions/lots";

import { useState, type FormEvent } from "react";

import type { Room } from "@/types/auction";
import { brl } from "@/lib/format";
import { date } from "@/lib/format";
import { labels } from "@/lib/format";

import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { Field } from "@/components/ui/field";
import { Countdown } from "@/components/auctions/countdown";
import { BidTable } from "@/components/auctions/bid-table";
export function LotRoom({ id }: { id: string }) {
  const session = useSession();
  const user = session.data?.user || null;
  const resource = useResource<Room>(`lots/${id}`, true);
  const lot = resource.data;
  const wallet = useResource<{ available: number }>(
    user?.role === "bidder" ? "wallet" : null,
    true,
  );
  const [amount, setAmount] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const sendBid = async (e: FormEvent) => {
    e.preventDefault();
    if (!lot) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await runAction(() =>
        placeBidAction(id, {
          amount: Math.round(Number(amount || minimum / 100) * 100),
        }),
      );
      setMessage("Lance aceito! Acompanhe a disputa.");
      setAmount("");
      await resource.refresh();
      await wallet.refresh();
    } catch (e) {
      setError((e as Error).message);
      await resource.refresh();
    } finally {
      setBusy(false);
    }
  };
  if (!lot)
    return (
      <Card>
        {resource.error ? <Notice>{resource.error}</Notice> : <Loading />}
      </Card>
    );
  const minimum = lot.bidCount
    ? lot.currentAmount + lot.increment
    : lot.initial;
  return (
    <Card>
      <Link href="/leiloes">Explorar leilões</Link>
      {resource.error && (
        <Notice>Atualização interrompida: {resource.error}</Notice>
      )}
      <Card.Content className="grid min-w-0 gap-6 lg:grid-cols-2">
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <ArtworkImage src={lot.item.image} alt={lot.item.title} />
            <Typography>{labels[lot.status]}</Typography>
          </Card.Content>
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Typography>
              Acervo Cleveland Museum of Art · Domínio público
            </Typography>
            <Link href={lot.item.sourceUrl} target="_blank" rel="noreferrer">
              Ver origem
            </Link>
          </Card.Content>
          <Card.Title>Dados da obra</Card.Title>
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Card.Content className="flex min-w-0 flex-col gap-4">
              <Typography>Artista</Typography>
              <Typography>{lot.item.artist}</Typography>
            </Card.Content>
            <Card.Content className="flex min-w-0 flex-col gap-4">
              <Typography>Data da obra</Typography>
              <Typography>{lot.item.date}</Typography>
            </Card.Content>
            <Card.Content className="flex min-w-0 flex-col gap-4">
              <Typography>Início</Typography>
              <Typography>{date(lot.startsAt)}</Typography>
            </Card.Content>
            <Card.Content className="flex min-w-0 flex-col gap-4">
              <Typography>Encerramento previsto</Typography>
              <Typography>{date(lot.endsAt)}</Typography>
            </Card.Content>
          </Card.Content>
        </Card.Content>
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Typography>{lot.item.artist}</Typography>
          <Typography.Heading level={1}>{lot.item.title}</Typography.Heading>
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Typography>
              {lot.bidCount ? "Lance atual" : "Lance inicial"}
            </Typography>
            <Typography>{brl(lot.currentAmount || lot.initial)}</Typography>
            <Typography>
              {lot.bidCount} lance{lot.bidCount !== 1 ? "s" : ""} registrado
              {lot.bidCount !== 1 ? "s" : ""}
            </Typography>
          </Card.Content>
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Card.Content className="flex min-w-0 flex-col gap-4">
              <Typography>
                {lot.status === "scheduled"
                  ? "Começa em"
                  : lot.status === "live"
                    ? "Encerra em"
                    : "Disputa finalizada"}
              </Typography>
              {["live", "scheduled"].includes(lot.status) && (
                <Countdown
                  end={lot.status === "scheduled" ? lot.startsAt : lot.endsAt}
                  serverTime={lot.serverTime}
                />
              )}
            </Card.Content>
          </Card.Content>
          {!lot.intact && (
            <Notice>
              Histórico adulterado. Este lote está bloqueado para sua segurança.
            </Notice>
          )}
          {user?.role === "bidder" && lot.position > 0 && (
            <Notice good={lot.isLeader}>
              {lot.isLeader
                ? lot.status === "closed"
                  ? "Você arrematou esta obra!"
                  : "Você está ganhando!"
                : "Você foi superado."}{" "}
              Sua posição: {lot.position}º.
            </Notice>
          )}
          {lot.status === "live" &&
            lot.intact &&
            (user?.role === "bidder" ? (
              <Form onSubmit={sendBid} className="flex flex-col gap-4">
                <Field
                  name="amount"
                  label="Seu lance (R$)"
                  type="number"
                  min={minimum / 100}
                  step="0.01"
                  value={amount}
                  placeholder={(minimum / 100).toFixed(2)}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={lot.isLeader}
                />
                <Card.Content className="flex min-w-0 flex-col gap-4">
                  <Typography>Mínimo: {brl(minimum)}</Typography>
                  <Typography>Incremento: {brl(lot.increment)}</Typography>
                </Card.Content>
                <Button
                  type="submit"

                  fullWidth
                  isPending={busy}
                  isDisabled={lot.isLeader || !!resource.error}
                >
                  {lot.isLeader ? "Você está na liderança" : "Confirmar lance"}
                </Button>
                <Typography.Paragraph>
                  Disponível: {wallet.data ? brl(wallet.data.available) : "…"}{" "}
                  <Link href="/carteira">Adicionar saldo</Link>
                </Typography.Paragraph>
              </Form>
            ) : user ? (
              <Notice>Leiloeiros não podem dar lances.</Notice>
            ) : (
              <Link href="/entrar">Entre para dar seu lance</Link>
            ))}
          {error && <Notice>{error}</Notice>}
          {message && <Notice good>{message}</Notice>}
          {lot.hasWinner && (
            <Link href={`/comprovante/${id}`}>Ver comprovante</Link>
          )}
          <Typography.Paragraph>
            Lances aceitos nos últimos 2 minutos prorrogam a disputa para 2
            minutos após o lance. Seu saldo fica reservado enquanto você
            liderar.
          </Typography.Paragraph>
          <Link href={`/auditoria/${id}`}>Verificar histórico deste lote </Link>
        </Card.Content>
      </Card.Content>
      <Card>
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Card.Title>Histórico de lances</Card.Title>
          <Typography>Histórico atualizado automaticamente</Typography>
        </Card.Content>
        <BidTable bids={lot.bids} />
      </Card>
    </Card>
  );
}
