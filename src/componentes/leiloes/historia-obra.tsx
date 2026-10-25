"use client";
import { Card, Link, Typography } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import { historiasObras } from "@/lib/historias-obras";

export function HistoriaObra({ identificador }: { identificador: string }) {
  const historia = historiasObras[identificador];
  if (!historia) return null;

  return (
    <Card variant="transparent" className="gap-3 p-0">
      <Card.Title className="flex items-center gap-2">
        <Icone nome="informacao" />
        História da obra
      </Card.Title>
      <Card.Content className="gap-3">
        <Typography className="text-base leading-relaxed">
          {historia.contexto}
        </Typography>
        <Typography className="text-base leading-relaxed">
          {historia.detalhe}
        </Typography>
      </Card.Content>
      <Card.Footer>
        <Link
          href={historia.fonte}
          target="_blank"
          rel="noreferrer"
          className="text-xs"
        >
          Fonte: Cleveland Museum of Art
          <Icone nome="externo" />
        </Link>
      </Card.Footer>
    </Card>
  );
}
