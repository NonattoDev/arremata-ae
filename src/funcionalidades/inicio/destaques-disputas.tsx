import Image from "next/image";
import { Card, Chip, Link, Separator, Typography } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import { formatarReais } from "@/lib/formatacao";
import type { Lote } from "@/tipos/leilao";

function ObraDaDisputa({ lote }: { lote: Lote }) {
  return (
    <Link
      href={`/lotes/${lote.id}`}
      className="group flex w-full items-center gap-3 rounded-xl"
      aria-label={`Ver leilão: ${lote.item.title}`}
    >
      <Image
        src={lote.item.image}
        alt=""
        width={48}
        height={56}
        unoptimized
        className="h-14 w-12 shrink-0 rounded-lg object-cover"
      />
      <Card.Content className="min-w-0 gap-1 p-0">
        <Typography className="line-clamp-2 text-sm font-medium leading-snug">
          {lote.item.title}
        </Typography>
        <Card.Description className="text-xs">
          {lote.item.artist}
        </Card.Description>
      </Card.Content>
      <Icone
        nome="seta"
        className="ml-auto text-accent transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </Link>
  );
}

export function DestaquesDisputas({ lotes, faixa = false }: { lotes: Lote[]; faixa?: boolean }) {
  const disputados = lotes.filter(
    (lote) => lote.bidCount > 0 && lote.status !== "cancelled",
  );
  const maiorLance = disputados.reduce<Lote | undefined>(
    (maior, lote) =>
      !maior || lote.currentAmount > maior.currentAmount ? lote : maior,
    undefined,
  );
  const maisDisputado = disputados.reduce<Lote | undefined>(
    (maior, lote) => (!maior || lote.bidCount > maior.bidCount ? lote : maior),
    undefined,
  );
  if (!maiorLance || !maisDisputado) return null;

  return (
    <Card className="h-fit gap-0 overflow-hidden border border-border/60 p-0 shadow-md">
      <Card.Header className="flex-row items-center gap-3 p-5">
        <Chip
          color="accent"
          variant="soft"
          className="h-10 w-10 justify-center"
        >
          <Icone nome="leilao" />
        </Chip>
        <Card.Content className="gap-1 p-0">
          <Card.Title className="text-lg">Nas disputas</Card.Title>
          <Card.Description className="text-xs">
            Destaques do catálogo
          </Card.Description>
        </Card.Content>
      </Card.Header>
      <Card.Content className={`gap-5 px-5 pb-5 ${faixa ? "grid md:grid-cols-2" : ""}`}>
        <Card variant="secondary" className="gap-4 rounded-2xl p-4">
          <Card.Content className="gap-2 p-0">
            <Card.Description className="text-xs font-medium">
              Maior lance registrado
            </Card.Description>
            <Typography className="font-[family-name:var(--fonte-texto)]! text-xl font-semibold tracking-normal tabular-nums text-blue-800 dark:text-blue-300">
              {formatarReais(maiorLance.currentAmount)}
            </Typography>
          </Card.Content>
          <ObraDaDisputa lote={maiorLance} />
        </Card>
        <Card.Content className={`gap-4 ${faixa ? "p-4" : "p-0"}`}>
          <Card.Content className="gap-1 p-0">
            <Card.Description className="text-xs font-medium">
              Mais lances recebidos
            </Card.Description>
            <Typography className="font-[family-name:var(--fonte-texto)]! text-2xl font-semibold tracking-tight tabular-nums">
              {maisDisputado.bidCount} lances
            </Typography>
          </Card.Content>
          <ObraDaDisputa lote={maisDisputado} />
        </Card.Content>
        {!faixa && <Separator />}
        <Card.Description className={`text-xs leading-relaxed ${faixa ? "md:col-span-2" : ""}`}>
          Considera os leilões em andamento e encerrados.
        </Card.Description>
      </Card.Content>
    </Card>
  );
}
