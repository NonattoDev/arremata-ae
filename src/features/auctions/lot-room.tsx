"use client";
import { useSession } from "@/components/providers/session-provider";
import { runAction } from "@/lib/run-action";
import { placeBidAction } from "@/server/actions/lots";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { Button } from "@heroui/react";
import {
  ArrowUpRight,
  ArrowRight,
  Gavel,
  ShieldCheck,
  Clock3,
  ArrowLeft,
} from "lucide-react";

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
      <section className="page">
        {resource.error ? <Notice>{resource.error}</Notice> : <Loading />}
      </section>
    );
  const minimum = lot.bidCount
    ? lot.currentAmount + lot.increment
    : lot.initial;
  return (
    <section className="page">
      <Link href="/" className="back">
        <ArrowLeft size={16} /> Explorar leilões
      </Link>
      {resource.error && (
        <Notice>Atualização interrompida: {resource.error}</Notice>
      )}
      <div className="room-grid">
        <div>
          <div className="room-art">
            <img src={lot.item.image} alt={lot.item.title} />
            <span className={`badge ${lot.status}`}>
              <i />
              {labels[lot.status]}
            </span>
          </div>
          <div className="art-credit">
            <span>Acervo Cleveland Museum of Art · Domínio público</span>
            <a href={lot.item.sourceUrl} target="_blank" rel="noreferrer">
              Ver origem <ArrowUpRight size={15} />
            </a>
          </div>
          <h2>Uma obra, muitos detalhes.</h2>
          <dl className="details">
            <div>
              <dt>Artista</dt>
              <dd>{lot.item.artist}</dd>
            </div>
            <div>
              <dt>Data da obra</dt>
              <dd>{lot.item.date}</dd>
            </div>
            <div>
              <dt>Início</dt>
              <dd>{date(lot.startsAt)}</dd>
            </div>
            <div>
              <dt>Encerramento previsto</dt>
              <dd>{date(lot.endsAt)}</dd>
            </div>
          </dl>
        </div>
        <div className="bid-panel panel">
          <span className="eyebrow">{lot.item.artist}</span>
          <h1>{lot.item.title}</h1>
          <div className="bid-value">
            <span>{lot.bidCount ? "Lance atual" : "Lance inicial"}</span>
            <strong>{brl(lot.currentAmount || lot.initial)}</strong>
            <small>
              {lot.bidCount} lance{lot.bidCount !== 1 ? "s" : ""} registrado
              {lot.bidCount !== 1 ? "s" : ""}
            </small>
          </div>
          <div className="time-box">
            <Clock3 size={19} />
            <div>
              <small>
                {lot.status === "scheduled"
                  ? "Começa em"
                  : lot.status === "live"
                    ? "Encerra em"
                    : "Disputa finalizada"}
              </small>
              {["live", "scheduled"].includes(lot.status) && (
                <strong>
                  <Countdown
                    end={lot.status === "scheduled" ? lot.startsAt : lot.endsAt}
                    serverTime={lot.serverTime}
                  />
                </strong>
              )}
            </div>
          </div>
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
              <form onSubmit={sendBid}>
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
                <div className="bid-help">
                  <span>Mínimo: {brl(minimum)}</span>
                  <span>Incremento: {brl(lot.increment)}</span>
                </div>
                <Button
                  type="submit"
                  className="orange-button"
                  fullWidth
                  isPending={busy}
                  isDisabled={lot.isLeader || !!resource.error}
                >
                  <Gavel size={18} />
                  {lot.isLeader ? "Você está na liderança" : "Confirmar lance"}
                </Button>
                <p className="available">
                  Disponível: {wallet.data ? brl(wallet.data.available) : "…"}{" "}
                  <Link href="/carteira">Adicionar saldo</Link>
                </p>
              </form>
            ) : user ? (
              <Notice>Leiloeiros não podem dar lances.</Notice>
            ) : (
              <Link className="button-link orange-button full" href="/entrar">
                Entre para dar seu lance <ArrowRight size={18} />
              </Link>
            ))}
          {error && <Notice>{error}</Notice>}
          {message && <Notice good>{message}</Notice>}
          {lot.hasWinner && (
            <Link
              className="button-link dark-button full"
              href={`/comprovante/${id}`}
            >
              Ver comprovante <ArrowUpRight size={17} />
            </Link>
          )}
          <p className="fine-print">
            Lances aceitos nos últimos 2 minutos prorrogam a disputa para 2
            minutos após o lance. Seu saldo fica reservado enquanto você
            liderar.
          </p>
          <Link className="audit-link" href={`/auditoria/${id}`}>
            <ShieldCheck size={18} /> Verificar histórico deste lote{" "}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      <section className="history">
        <div className="section-heading">
          <h2>Cada lance conta.</h2>
          <span className="muted">Histórico atualizado automaticamente</span>
        </div>
        <BidTable bids={lot.bids} />
      </section>
    </section>
  );
}
