"use client";

import Link from "next/link";

import { ShieldCheck, ArrowLeft } from "lucide-react";

import type { Bid } from "@/types/auction";
import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { BidTable } from "@/components/auctions/bid-table";
import { Share } from "@/components/ui/share";
export function Audit({ id }: { id: string }) {
  const { data, error } = useResource<{
    title: string;
    intact: boolean;
    bids: Bid[];
    checkpoint: string;
  }>(`audit/${id}`, true);
  if (!data)
    return (
      <section className="page">
        {error ? <Notice>{error}</Notice> : <Loading />}
      </section>
    );
  return (
    <section className="page">
      <Link href={`/lotes/${id}`} className="back">
        <ArrowLeft size={16} /> Voltar ao lote
      </Link>
      <span className="eyebrow">TRANSPARÊNCIA, SEM PRECISAR DE LOGIN</span>
      <h1>Histórico aberto. Confiança verificada.</h1>
      <p className="lead">{data.title}</p>
      {error && <Notice>{error}</Notice>}
      <div className={`audit-result ${data.intact ? "" : "broken"}`}>
        <ShieldCheck size={36} />
        <div>
          <h2>{data.intact ? "Histórico íntegro" : "Adulteração detectada"}</h2>
          <p>
            {data.intact
              ? "Os lances e o checkpoint correspondem aos registros autenticados pelo servidor."
              : "Há registros alterados, inseridos ou removidos. As operações deste lote estão bloqueadas."}
          </p>
        </div>
        <Share path={`/auditoria/${id}`} />
      </div>
      <BidTable bids={data.bids} />
      <div className="panel audit-explanation">
        <h2>Como verificamos?</h2>
        <p>
          Cada lance tem uma assinatura HMAC que inclui o lance anterior. Um
          checkpoint autenticado registra a quantidade e o último lance,
          permitindo detectar também a remoção do final do histórico. A chave
          fica fora do banco de dados.
        </p>
        <p>
          Os participantes aparecem com identificadores públicos, sem nomes ou
          e-mails. Esta verificação é feita pelo servidor; não é uma
          certificação externa nem protege contra comprometimento da chave ou
          restauração integral de um snapshot válido.
        </p>
        <label>Checkpoint atual</label>
        <code>{data.checkpoint}</code>
      </div>
    </section>
  );
}
