import { FichaAcervo } from "./ficha-acervo";
import { Icone } from "@/componentes/ui/icone";
import { Card, Link, Typography } from "@heroui/react";
import type { Lote } from "@/tipos/leilao";
import { formatarDataHora } from "@/lib/formatacao";
import { HistoriaObra } from "./historia-obra";

export function DadosObra({ lote }: { lote: Lote }) {
  const detalhes = [
    ["Artista", lote.item.artist],
    ["Data da obra", lote.item.date],
    ["Início", formatarDataHora(lote.startsAt)],
    ["Encerramento previsto", formatarDataHora(lote.endsAt)],
  ];

  return (
    <Card
      variant="secondary"
      className="min-w-0 gap-6 rounded-3xl border border-orange-200/60 bg-[#f7f2e9] p-6 sm:p-8 dark:border-stone-700 dark:bg-stone-900"
    >
      <Card.Title className="flex items-center gap-2 text-[#993f26] dark:text-orange-300">
        <Icone nome="imagem" /> Sobre a obra
      </Card.Title>
      <HistoriaObra identificador={lote.item.externalId} />
      <FichaAcervo
        identificador={lote.item.externalId}
        imagem={lote.item.image}
        titulo={lote.item.title}
      />
      <Card.Content className="grid min-w-0 gap-5 sm:grid-cols-2">
        {detalhes.map(([rotulo, valor]) => (
          <Card.Content key={rotulo} className="min-w-0 gap-1">
            <Card.Description>{rotulo}</Card.Description>
            <Typography>{valor}</Typography>
          </Card.Content>
        ))}
      </Card.Content>
      <Card.Footer className="flex-wrap gap-2">
        <Card.Description>
          Cleveland Museum of Art · Domínio público
        </Card.Description>
        <Link href={lote.item.sourceUrl} target="_blank" rel="noreferrer">
          <Icone nome="externo" />
          Consultar acervo
        </Link>
      </Card.Footer>
    </Card>
  );
}
