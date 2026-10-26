import { Card, Chip, Typography } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import { formatarDataHora } from "@/lib/formatacao";

export function AberturaLances({ inicio }: { inicio: string }) {
  return (
    <Card className="min-w-0 gap-4 rounded-3xl border border-border/60 p-5 sm:p-6">
      <Card.Header className="flex-row items-center gap-3 p-0">
        <Chip variant="soft" color="accent" aria-hidden="true">
          <Icone nome="tempo" />
        </Chip>
        <Card.Title>Aguardando abertura</Card.Title>
      </Card.Header>
      <Card.Content className="gap-2 rounded-2xl bg-orange-50 p-4 dark:bg-orange-950/30">
        <Card.Description>Lances a partir de</Card.Description>
        <Typography className="text-base font-medium tabular-nums">
          {formatarDataHora(inicio)}
        </Typography>
      </Card.Content>
      <Card.Description className="text-sm leading-relaxed">
        Quando o leilão começar, acompanhe os lances aqui.
      </Card.Description>
    </Card>
  );
}
