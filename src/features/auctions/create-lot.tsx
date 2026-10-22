"use client";
import { runAction } from "@/lib/run-action";
import { createLotAction } from "@/server/actions/lots";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ArrowUpRight, Search, Check, ArrowLeft } from "lucide-react";

import type { User } from "@/types/auction";
import { api } from "@/lib/api";
import { Notice } from "@/components/ui/notice";
import { Field } from "@/components/ui/field";
export function CreateLot({ user }: { user: User }) {
  const router = useRouter();
  const [query, setQuery] = useState("Monet"),
    [results, setResults] = useState<
      { id: string; title: string; artist: string; image: string }[]
    >([]),
    [selected, setSelected] = useState(""),
    [busy, setBusy] = useState(false),
    [searching, setSearching] = useState(false),
    [error, setError] = useState("");
  const search = async (e: FormEvent) => {
    e.preventDefault();
    setSearching(true);
    setError("");
    setSelected("");
    setResults([]);
    try {
      const r = await api<typeof results>(
        `catalog?q=${encodeURIComponent(query)}`,
      );
      setResults(r);
      if (!r.length)
        setError("Nenhuma obra com imagem disponível. Tente outro artista.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  };
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) {
      setError("Escolha uma obra no catálogo.");
      return;
    }
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await runAction(() =>
        createLotAction({
          externalId: selected,
          initial: Math.round(Number(values.initial) * 100),
          increment: Math.round(Number(values.increment) * 100),
          startsAt: new Date(String(values.start)).toISOString(),
          endsAt: new Date(String(values.end)).toISOString(),
        }),
      );
      router.push(`/lotes/${r.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  if (user.role !== "seller")
    return (
      <section className="page">
        <Notice>Apenas leiloeiros podem criar lotes.</Notice>
      </section>
    );
  return (
    <section className="page">
      <Link href="/meus-lotes" className="back">
        <ArrowLeft size={16} /> Meus lotes
      </Link>
      <span className="eyebrow">UM NOVO ENCONTRO COM A ARTE</span>
      <h1>Coloque uma história em disputa.</h1>
      <p className="lead">
        Escolha uma obra em domínio público do Cleveland Museum of Art.
      </p>
      <form onSubmit={search} className="catalog-search">
        <label className="search-box">
          <Search size={18} />
          <input
            aria-label="Buscar no catálogo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome da obra ou artista"
            maxLength={80}
          />
        </label>
        <Button type="submit" className="dark-button" isPending={searching}>
          Buscar obras
        </Button>
      </form>
      {error && <Notice>{error}</Notice>}
      <div className="import-grid">
        {results.map((r) => (
          <button
            type="button"
            aria-pressed={selected === r.id}
            className={selected === r.id ? "import-card chosen" : "import-card"}
            key={r.id}
            onClick={() => setSelected(r.id)}
          >
            <img src={r.image} alt={r.title} />
            <strong>{r.title}</strong>
            <span>{r.artist}</span>
            {selected === r.id && (
              <span className="chosen-label">
                <Check size={14} />
                Selecionada
              </span>
            )}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="panel lot-form">
        <h2>Defina as regras do lote.</h2>
        <div className="form-grid">
          <Field
            name="initial"
            label="Lance inicial (R$)"
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            defaultValue="100"
            required
          />
          <Field
            name="increment"
            label="Incremento mínimo (R$)"
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            defaultValue="10"
            required
          />
          <Field
            name="start"
            label="Início (seu horário local)"
            type="datetime-local"
            required
          />
          <Field
            name="end"
            label="Encerramento (seu horário local)"
            type="datetime-local"
            required
          />
        </div>
        <p className="fine-print">
          Ao publicar, salvamos os dados e a imagem da obra. Seu lote continuará
          disponível mesmo se a API do museu estiver fora do ar. Lotes com
          lances não podem ser cancelados.
        </p>
        <Button
          type="submit"
          className="orange-button"
          isDisabled={!selected}
          isPending={busy}
        >
          Publicar lote <ArrowUpRight size={18} />
        </Button>
      </form>
    </section>
  );
}
