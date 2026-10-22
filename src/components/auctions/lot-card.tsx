"use client";
import { ArtworkImage } from "@/components/auctions/artwork-image";
import { Card, Chip, Link, Typography } from "@heroui/react";
import type { Lot } from "@/types/auction";
import { brl, labels } from "@/lib/format";
import { Countdown } from "./countdown";
export function LotCard({ lot }: { lot: Lot }) {
  return (
    <Card className="min-w-0">
      <Card.Header>
        <Chip>{labels[lot.status]}</Chip>
        <Card.Title>
          <Link href={`/lotes/${lot.id}`}>{lot.item.title}</Link>
        </Card.Title>
        <Card.Description>
          {lot.item.artist} · {lot.item.date}
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <ArtworkImage src={lot.item.image} alt={lot.item.title} compact />
        <Typography>
          {lot.bidCount ? "Lance atual" : "Lance inicial"}:{" "}
          {brl(lot.currentAmount || lot.initial)}
        </Typography>
      </Card.Content>
      <Card.Footer className="flex flex-wrap items-center gap-3">
        {lot.status === "live" ? (
          <Countdown end={lot.endsAt} />
        ) : (
          <Typography>
            {lot.status === "scheduled"
              ? new Date(lot.startsAt).toLocaleDateString("pt-BR")
              : lot.bidCount + " lances"}
          </Typography>
        )}
        <Link href={`/lotes/${lot.id}`}>Ver lote</Link>
      </Card.Footer>
    </Card>
  );
}
