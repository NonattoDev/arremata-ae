import { Card, Link, Typography } from "@heroui/react";
import type { Lote } from "@/tipos/leilao";
import { GaleriaObra } from "./galeria-obra";
import { Icone } from "@/componentes/ui/icone";

export function ApresentacaoObra({ lote }: { lote: Lote }) {
  return (
    <Card className="min-w-0 gap-0 overflow-hidden rounded-3xl border border-border/60 bg-surface p-0 shadow-sm">
      <Card.Content className="gap-5 p-5 sm:p-8">
        <Card.Header className="flex-row items-center justify-between gap-3 p-0">
          <Typography className="flex items-center gap-2 text-xs font-medium tracking-widest text-muted uppercase">
            <Icone nome="imagem" /> A obra
          </Typography>
          <Typography className="text-sm text-muted">
            {lote.item.date}
          </Typography>
        </Card.Header>
        <Card variant="transparent" className="gap-0 p-0">
          <GaleriaObra
            lote={lote}
            destaque
            className="h-64! p-0 sm:h-[25rem]!"
          />
        </Card>
        <Typography className="text-center text-xs text-muted">
          Toque na obra para explorar os detalhes
        </Typography>
      </Card.Content>
      <Card.Footer className="flex-wrap items-center justify-between gap-4 border-t border-border/50 p-5 sm:px-8">
        <Card.Content className="flex-none gap-1 p-0">
          <Typography className="text-sm font-semibold">
            {lote.item.artist}
          </Typography>
          <Card.Description className="text-xs">
            Cleveland Museum of Art
          </Card.Description>
        </Card.Content>
        <Link
          href={lote.item.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm"
        >
          Consultar acervo <Icone nome="externo" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
