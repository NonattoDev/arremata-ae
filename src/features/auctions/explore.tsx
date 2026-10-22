"use client";
import {
  Card,
  Typography,
  SearchField,
  Label,
  Input,
  Tabs,
} from "@heroui/react";
import { useState } from "react";

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
    <Card>
      <Card.Header>
        <Typography.Heading level={1}>Leilões de arte</Typography.Heading>
        <Card.Description>
          Consulte os lotes, confira os valores e acompanhe os lances.
        </Card.Description>
      </Card.Header>
      <Card.Content id="leiloes" className="flex min-w-0 flex-col gap-6">
        <SearchField value={query} onChange={setQuery}>
          <Label>Buscar obra ou artista</Label>
          <Input placeholder="Busque uma obra ou artista" />
        </SearchField>
        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) => setTab(String(key))}
        >
          <Tabs.List aria-label="Status dos leilões" className="flex flex-wrap">
            {["live", "scheduled", "closed"].map((status) => (
              <Tabs.Tab key={status} id={status}>
                {labels[status]} (
                {lots?.filter((l) => l.status === status).length || 0})
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {["live", "scheduled", "closed"].map((status) => (
            <Tabs.Panel
              key={status}
              id={status}
              className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {error && <Notice>{error}</Notice>}
              {!lots && !error ? (
                <Loading />
              ) : visible.length ? (
                visible.map((l) => <LotCard key={l.id} lot={l} />)
              ) : (
                <Empty
                  title={
                    query
                      ? "Nenhuma obra encontrada."
                      : "Nenhum lote nesta categoria."
                  }
                />
              )}
            </Tabs.Panel>
          ))}
        </Tabs>
      </Card.Content>
    </Card>
  );
}
