"use client";

import { Card, Chip, Typography } from "@heroui/react";
import type { Lote } from "@/tipos/leilao";
import { CarrosselDestaques } from "./carrossel-destaques";
import { LinkAnimado } from "@/componentes/ui/link-animado";
import { IndicadorAoVivo } from "@/componentes/leiloes/indicador-ao-vivo";
import { PalavraArte } from "./palavra-arte";

export function DestaqueInicial({
  lotes,
  quantidade,
}: {
  lotes: Lote[];
  quantidade: number;
}) {
  return (
    <Card className="grid gap-0 overflow-hidden p-0 lg:grid-cols-2">
      <Card.Content className="justify-center gap-6 p-6 sm:p-10 lg:p-12">
        {quantidade > 0 ? (
          <IndicadorAoVivo rotulo={`${quantidade} leilões ao vivo`} />
        ) : (
          <Chip variant="tertiary">Catálogo de arte</Chip>
        )}
        <Typography.Heading
          level={1}
          className="max-w-lg text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl"
        >
          Leilões de{" "}
          <PalavraArte />
        </Typography.Heading>
        <Card.Description className="max-w-md text-base leading-7">
          Veja as obras, consulte o histórico de lances e acompanhe o
          encerramento de cada lote.
        </Card.Description>
        <Card.Footer className="flex-wrap gap-3">
          <LinkAnimado href="/leiloes">
            {quantidade > 0 ? "Ver leilões ao vivo" : "Explorar leilões"}
          </LinkAnimado>
        </Card.Footer>
      </Card.Content>
      {lotes.length > 0 && <CarrosselDestaques lotes={lotes} />}
    </Card>
  );
}
