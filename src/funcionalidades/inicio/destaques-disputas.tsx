import Image from "next/image";
import { Card, Chip, Link, Typography } from "@heroui/react";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";
import { formatarReais } from "@/lib/formatacao";
import type { Lote } from "@/tipos/leilao";

function DestaqueDisputa({
  lote,
  rotulo,
  valor,
  detalhe,
  icone,
  destaque,
}: {
  lote: Lote;
  rotulo: string;
  valor: string;
  detalhe: string;
  icone: NomeIcone;
  destaque?: boolean;
}) {
  return (
    <Card
      variant="transparent"
      className={`min-w-0 gap-2 rounded-xl p-3 ${destaque ? "bg-accent-soft" : "bg-success-soft"}`}
    >
      <Card.Header className="flex-row items-center justify-between gap-2 p-0">
        <Typography className="text-xs font-semibold">{rotulo}</Typography>
        <Icone
          nome={icone}
          className={destaque ? "text-accent" : "text-success"}
        />
      </Card.Header>
      <Card.Content className="gap-1 p-0">
        <Typography
          className={`text-xl font-semibold tabular-nums ${destaque ? "text-blue-800 dark:text-blue-200" : "text-emerald-900 dark:text-emerald-200"}`}
        >
          {valor}
        </Typography>
        <Typography className="text-xs leading-snug">{detalhe}</Typography>
      </Card.Content>
      <Link
        href={`/lotes/${lote.id}`}
        className="group flex min-w-0 items-center gap-2 rounded-lg no-underline"
        aria-label={`Ver leilão: ${lote.item.title}`}
      >
        <Image
          src={lote.item.image}
          alt=""
          width={56}
          height={64}
          unoptimized
          className="h-12 w-10 shrink-0 rounded-md object-cover"
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
          className="ml-auto text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </Link>
    </Card>
  );
}

export function DestaquesDisputas({
  lotes,
  faixa = false,
}: {
  lotes: Lote[];
  faixa?: boolean;
}) {
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
  const totalLances = disputados.reduce(
    (total, lote) => total + lote.bidCount,
    0,
  );
  const aumento =
    maiorLance.initial > 0
      ? (maiorLance.currentAmount / maiorLance.initial - 1) * 100
      : 0;
  const variacao =
    aumento > 0
      ? `${aumento.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% acima do lance inicial`
      : "O maior valor ofertado no catálogo";
  return (
    <Card className="h-fit gap-3 overflow-hidden border border-border/60 p-4 shadow-md">
      <Card.Header className="grid min-w-0 grid-cols-[32px_minmax(0,1fr)] items-center gap-x-2 gap-y-1 p-0">
        <Chip
          color="accent"
          variant="soft"
          className="h-8 w-8 shrink-0 justify-center"
        >
          <Icone nome="leilao" />
        </Chip>
        <Card.Content className="min-w-0 gap-1 p-0">
          <Card.Title className="text-lg leading-snug">Nas disputas</Card.Title>
        </Card.Content>
        <Chip size="sm" variant="soft" className="col-span-2 w-fit max-w-full shrink-0">
          {totalLances}{" "}
          {totalLances === 1 ? "lance registrado" : "lances registrados"}
        </Chip>
      </Card.Header>
      <Card.Content
        className={`min-w-0 gap-2 p-0 ${faixa ? "grid md:grid-cols-2" : ""}`}
      >
        <DestaqueDisputa
          lote={maiorLance}
          rotulo="Maior lance"
          valor={formatarReais(maiorLance.currentAmount)}
          detalhe={variacao}
          icone="pagamento"
          destaque
        />
        <DestaqueDisputa
          lote={maisDisputado}
          rotulo="Mais disputada"
          valor={`${maisDisputado.bidCount} ${maisDisputado.bidCount === 1 ? "lance" : "lances"}`}
          detalhe="A obra que mais recebeu ofertas"
          icone="leilao"
        />
      </Card.Content>
      <Card.Description className="flex items-start gap-2 text-xs leading-relaxed">
        <Icone nome="informacao" className="text-sm" />
        Dados do catálogo, incluindo leilões encerrados.
      </Card.Description>
    </Card>
  );
}
