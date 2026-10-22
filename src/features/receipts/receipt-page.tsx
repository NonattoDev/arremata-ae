"use client";

import Link from "next/link";

import { ArrowUpRight, ShieldCheck, ArrowLeft } from "lucide-react";
import type { Item } from "@/server/auction";

import { brl } from "@/lib/format";
import { date } from "@/lib/format";
import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { Share } from "@/components/ui/share";
export function Receipt({ id }: { id: string }) {
  const { data, error } = useResource<{
    item: Item;
    winner: string;
    amount: number;
    settledAt: string;
    checkpoint: string;
  }>(`receipts/${id}`);
  if (!data)
    return (
      <section className="page">
        {error ? <Notice>{error}</Notice> : <Loading />}
      </section>
    );
  return (
    <section className="page narrow">
      <Link href={`/lotes/${id}`} className="back">
        <ArrowLeft size={16} /> Voltar ao lote
      </Link>
      <div className="panel receipt">
        <ShieldCheck size={40} />
        <span className="eyebrow">COMPROVANTE DE ARREMATE</span>
        <h1>
          Uma nova história
          <br />
          foi arrematada.
        </h1>
        <img src={data.item.image} alt={data.item.title} />
        <h2>{data.item.title}</h2>
        <p>{data.item.artist}</p>
        <dl className="details">
          <div>
            <dt>Arrematante</dt>
            <dd>{data.winner}</dd>
          </div>
          <div>
            <dt>Valor</dt>
            <dd>{brl(data.amount)}</dd>
          </div>
          <div>
            <dt>Liquidado em</dt>
            <dd>{date(data.settledAt)}</dd>
          </div>
        </dl>
        <Share path={`/comprovante/${id}`} />
        <Link className="audit-link" href={`/auditoria/${id}`}>
          Verificar histórico <ArrowUpRight size={16} />
        </Link>
        <p className="fine-print">
          Comprovante demonstrativo. Não representa venda de obra física nem
          transação com dinheiro real.
        </p>
      </div>
    </section>
  );
}
