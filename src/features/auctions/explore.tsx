"use client";
import { useState } from "react";
import Link from "next/link";

import {
  ArrowUpRight,
  Gavel,
  ShieldCheck,
  Wallet,
  Search,
  Radio,
} from "lucide-react";

import type { Lot } from "@/types/auction";
import { labels } from "@/lib/format";
import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Loading } from "@/components/ui/loading";
import { Empty } from "@/components/ui/empty";
import { LotCard } from "@/components/auctions/lot-card";
export function Explore() {
  const { data: lots, error } = useResource<Lot[]>("lots", true);
  const [tab, setTab] = useState("live"),
    [query, setQuery] = useState("");
  const visible =
    lots?.filter(
      (l) =>
        l.status === tab &&
        `${l.item.title} ${l.item.artist}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    ) || [];
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> O EXTRAORDINÁRIO PODE SER SEU
          </span>
          <h1>
            Dê seu lance.
            <br />
            Leve uma <em>história.</em>
          </h1>
          <p>
            Descubra obras que atravessam o tempo.
            <br />
            Acompanhe cada lance e encontre a sua próxima conquista.
          </p>
          <a className="button-link orange-button" href="#leiloes">
            Explorar leilões <ArrowUpRight size={20} />
          </a>
          <div className="hero-trust">
            <ShieldCheck size={18} />
            <span>Lances transparentes. Histórico verificável.</span>
          </div>
        </div>
        <div className="hero-art">
          {lots?.[0] ? (
            <>
              <img src={lots[0].item.image} alt={lots[0].item.title} />
              <div className="hero-caption">
                <div>
                  <span>EM DESTAQUE</span>
                  <strong>{lots[0].item.artist}</strong>
                </div>
                <Link
                  href={`/lotes/${lots[0].id}`}
                  aria-label="Ver lote em destaque"
                >
                  <ArrowUpRight />
                </Link>
              </div>
              <div className="art-label">
                UMA OBRA.
                <br />
                INFINITAS HISTÓRIAS.
              </div>
            </>
          ) : (
            <div className="art-placeholder">
              <Gavel size={60} />
              <span>Seu próximo encontro com a arte.</span>
            </div>
          )}
        </div>
      </section>
      <section className="benefits">
        <div>
          <Radio />
          <span>
            <strong>Disputa ao vivo</strong>Novos lances sem recarregar
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <strong>Histórico auditável</strong>Transparência em cada lance
          </span>
        </div>
        <div>
          <Wallet />
          <span>
            <strong>Carteira simulada</strong>Explore sem dinheiro real
          </span>
        </div>
      </section>
      <section className="catalog-section" id="leiloes">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ENCONTRE O QUE TE MOVE</span>
            <h2>O próximo lance é seu.</h2>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input
              aria-label="Buscar obra ou artista"
              placeholder="Busque uma obra ou artista"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
        <div className="tabs" role="tablist" aria-label="Status dos leilões">
          {["live", "scheduled", "closed"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={tab === t ? "selected" : ""}
            >
              {t === "live" && <span className="live-dot" />}
              {labels[t]}
              <span className="count">
                {lots?.filter((l) => l.status === t).length || 0}
              </span>
            </button>
          ))}
        </div>
        {error && <Notice>{error}</Notice>}
        {!lots && !error ? (
          <Loading />
        ) : visible.length ? (
          <div className="lot-grid">
            {visible.map((l) => (
              <LotCard key={l.id} lot={l} />
            ))}
          </div>
        ) : (
          <Empty
            title={
              query
                ? "Nenhuma obra encontrada."
                : "Nenhum lote nesta categoria."
            }
          />
        )}
      </section>
      <section className="how">
        <span className="eyebrow">SIMPLES ASSIM</span>
        <h2>Da descoberta ao arremate.</h2>
        <div className="steps">
          {[
            [
              "01",
              "Encontre sua obra",
              "Explore o acervo e escolha a história que combina com você.",
            ],
            [
              "02",
              "Entre na disputa",
              "Adicione saldo simulado e acompanhe seus lances ao vivo.",
            ],
            [
              "03",
              "Celebre a conquista",
              "Venceu? Seu comprovante fica disponível para compartilhar.",
            ],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
