import { Card, Surface, Typography } from "@heroui/react";
import type { Lote } from "@/tipos/leilao";
import { dataLocal } from "@/lib/datas";
import { ContagemRegressiva } from "./contagem-regressiva";

export function PrazoLote({ lote }: { lote: Lote }) {
  const aoVivo = lote.status === "live";
  const agendado = lote.status === "scheduled";
  if (lote.status === "cancelled") {
    return <Card.Description>Cancelado sem lances</Card.Description>;
  }
  return (
    <Surface
      variant="secondary"
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-3"
    >
      <Card.Description>
        {aoVivo ? "Encerra em" : agendado ? "Abertura" : "Encerrado em"}
      </Card.Description>
      {aoVivo ? (
        <ContagemRegressiva end={lote.endsAt} />
      ) : (
        <Typography className="text-sm font-medium tabular-nums">
          {dataLocal(agendado ? lote.startsAt : lote.endsAt).format(
            "DD/MM · HH:mm",
          )}
        </Typography>
      )}
    </Surface>
  );
}
