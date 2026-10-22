"use client";

import Link from "next/link";

import { ArrowUpRight, Clock3 } from "lucide-react";

import type { Lot } from "@/types/auction";
import { brl } from "@/lib/format";
import { date } from "@/lib/format";
import { labels } from "@/lib/format";
import { Countdown } from "@/components/auctions/countdown";
export function LotCard({ lot }: { lot: Lot }) {
  return (
    <Link href={`/lotes/${lot.id}`} className="lot-card">
      <div className="art-wrap">
        <img src={lot.item.image} alt={lot.item.title} loading="lazy" />
        <span className={`badge ${lot.status}`}>
          <i />
          {labels[lot.status]}
        </span>
        <span className="art-arrow">
          <ArrowUpRight size={20} />
        </span>
      </div>
      <div className="card-meta">
        <span>{lot.item.artist}</span>
        <span>{lot.item.date}</span>
      </div>
      <h3>{lot.item.title}</h3>
      <div className="card-bottom">
        <div>
          <span>{lot.bidCount ? "Lance atual" : "Lance inicial"}</span>
          <strong>{brl(lot.currentAmount || lot.initial)}</strong>
        </div>
        <div className="card-time">
          <Clock3 size={14} />
          {lot.status === "live" ? (
            <Countdown end={lot.endsAt} />
          ) : lot.status === "scheduled" ? (
            <span>{new Date(lot.startsAt).toLocaleDateString("pt-BR")}</span>
          ) : (
            <span>{lot.bidCount} lances</span>
          )}
        </div>
      </div>
    </Link>
  );
}
