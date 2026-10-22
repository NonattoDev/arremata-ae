"use client";
import { ArtworkImage } from "@/components/auctions/artwork-image";
import { runAction } from "@/lib/run-action";
import { createLotAction } from "@/server/actions/lots";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Description,
  Form,
  Label,
  Link,
  Radio,
  RadioGroup,
  SearchField,
  Input,
  Typography,
} from "@heroui/react";

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
    return <Notice>Apenas leiloeiros podem criar lotes.</Notice>;
  return (
    <Card>
      <Card.Header>
        <Link href="/meus-lotes">Meus lotes</Link>
        <Typography.Heading level={1}>
          Coloque uma história em disputa.
        </Typography.Heading>
        <Card.Description>
          Escolha uma obra em domínio público do Cleveland Museum of Art.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Form onSubmit={search} className="flex flex-col gap-4">
          <SearchField value={query} onChange={setQuery} maxLength={80}>
            <Label>Buscar no catálogo</Label>
            <Input placeholder="Nome da obra ou artista" />
          </SearchField>
          <Button type="submit" isPending={searching}>
            Buscar obras
          </Button>
        </Form>
      </Card.Content>
      {error && <Notice>{error}</Notice>}
      {results.length > 0 && (
        <RadioGroup
          aria-label="Escolha uma obra"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          value={selected}
          onChange={setSelected}
        >
          {results.map((r) => (
            <Card key={r.id}>
              <Card.Content className="flex min-w-0 flex-col gap-4">
                <ArtworkImage src={r.image} alt={r.title} compact />
                <Radio value={r.id}>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>{r.title}</Label>
                    <Description>{r.artist}</Description>
                  </Radio.Content>
                </Radio>
              </Card.Content>
            </Card>
          ))}
        </RadioGroup>
      )}
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Form onSubmit={submit} className="flex flex-col gap-4">
          <Typography.Heading level={2}>
            Defina as regras do lote.
          </Typography.Heading>
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
          <Typography.Paragraph size="sm">
            Ao publicar, salvamos os dados e a imagem da obra. Seu lote continua
            disponível mesmo se a API estiver fora do ar. Lotes com lances não
            podem ser cancelados.
          </Typography.Paragraph>
          <Button type="submit" isDisabled={!selected} isPending={busy}>
            Publicar lote
          </Button>
        </Form>
      </Card.Content>
    </Card>
  );
}
