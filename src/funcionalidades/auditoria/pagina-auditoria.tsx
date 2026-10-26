"use client";
import { useState } from "react";
import { Icone } from "@/componentes/ui/icone";
import type { Lance } from "@/tipos/leilao";
import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Carregando } from "@/componentes/ui/carregando";
import { HistoricoLances } from "@/componentes/leiloes/historico-lances";
import { formatarDataHora } from "@/lib/formatacao";
import { Accordion, Button, Card, Chip, Link, Typography } from "@heroui/react";

export function PaginaAuditoria({ id }: { id: string }) {
  const [pagina, definirPagina] = useState(1);
  const [atualizando, definirAtualizando] = useState(false);
  const { dados, erro, atualizar } = useRecurso<{
    title: string;
    intact: boolean;
    bids: Lance[];
    checkpoint: string;
    total: number;
    pagina: number;
    totalPaginas: number;
    porPagina: number;
    verificadoEm: string;
  }>(`audit/${id}?pagina=${pagina}`);
  return (
    <Card variant="transparent" className="min-w-0 gap-5 p-0">
      <Link
        href={`/lotes/${id}`}
        className="w-fit gap-2 text-sm text-accent no-underline!"
      >
        <Icone nome="voltar" />
        Voltar ao leilão
      </Link>
      <Card className="min-w-0 gap-5 rounded-3xl border border-border/60 p-5 sm:p-8">
        <Card.Header className="flex-row flex-wrap items-center justify-between gap-4 p-0">
          <Card.Content className="min-w-0 flex-row items-center gap-3 p-0">
            <Chip
              color="accent"
              variant="soft"
              className="h-12 w-12 shrink-0 justify-center rounded-2xl"
            >
              <Icone nome="auditoria" />
            </Chip>
            <Card.Content className="min-w-0 gap-1 p-0">
              <Typography.Heading
                level={1}
                className="text-2xl font-medium sm:text-3xl"
              >
                Auditoria do leilão
              </Typography.Heading>
              <Card.Description>
                Consulte os lances e a integridade do registro.
              </Card.Description>
            </Card.Content>
          </Card.Content>
        </Card.Header>
        {erro && <Aviso>{erro}</Aviso>}
        {!dados ? (
          !erro && <Carregando />
        ) : (
          <>
            <Typography className="font-[family-name:var(--fonte-arte)]! text-xl leading-snug sm:text-2xl">
              {dados.title}
            </Typography>
            <Card.Content className="grid min-w-0 gap-3 p-0 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <Card
                variant="transparent"
                className={`gap-2 rounded-2xl p-5 ${dados.intact ? "bg-success-soft" : "bg-danger-soft"}`}
              >
                <Card.Title className="flex items-center gap-2">
                  <Icone nome={dados.intact ? "auditoria" : "informacao"} />
                  {dados.intact ? "Histórico íntegro" : "Adulteração detectada"}
                </Card.Title>
                <Typography className="text-sm leading-relaxed">
                  {dados.intact
                    ? "Todos os lances conferem com os registros autenticados pelo servidor."
                    : "Foram encontradas inconsistências. As operações deste lote estão bloqueadas."}
                </Typography>
                <Typography className="text-xs text-muted">
                  Verificado em {formatarDataHora(dados.verificadoEm)}
                </Typography>
              </Card>
              <Card
                variant="secondary"
                className="justify-center gap-2 rounded-2xl p-5"
              >
                <Card.Description className="flex items-center gap-2">
                  <Icone nome="historico" />
                  Lances verificados
                </Card.Description>
                <Typography className="text-3xl font-semibold tabular-nums text-blue-800 dark:text-blue-200">
                  {dados.total.toLocaleString("pt-BR")}
                </Typography>
              </Card>
            </Card.Content>
            <Card.Header className="flex-row flex-wrap items-center justify-between gap-3 p-0">
              <Card.Title className="flex items-center gap-2">
                <Icone nome="historico" />
                Registro de lances
              </Card.Title>
              <Button
                size="sm"
                variant="secondary"
                isPending={atualizando}
                onPress={async () => {
                  definirAtualizando(true);
                  try {
                    await atualizar();
                  } finally {
                    definirAtualizando(false);
                  }
                }}
              >
                <Icone nome="restaurar" />
                Atualizar
              </Button>
            </Card.Header>
            <Card.Content className="min-w-0 p-0">
              <HistoricoLances lances={dados.bids} />
            </Card.Content>
            <Card.Footer className="flex-row flex-wrap items-center justify-between gap-3 p-0">
              <Typography className="text-xs text-muted" aria-live="polite">
                Página {dados.pagina} de {dados.totalPaginas} · Até{" "}
                {dados.porPagina} lances por página
              </Typography>
              <Card.Content className="flex-none flex-row items-center gap-2 p-0">
                <Button
                  size="sm"
                  variant="secondary"
                  isDisabled={dados.pagina <= 1}
                  onPress={() => definirPagina(dados.pagina - 1)}
                >
                  <Icone nome="voltar" />
                  Anterior
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  isDisabled={dados.pagina >= dados.totalPaginas}
                  onPress={() => definirPagina(dados.pagina + 1)}
                >
                  Próxima
                  <Icone nome="voltar" className="rotate-180" />
                </Button>
              </Card.Content>
            </Card.Footer>
            <Accordion>
              <Accordion.Item id="verificacao">
                <Accordion.Heading>
                  <Accordion.Trigger className="gap-2">
                    <Icone nome="informacao" />
                    Como verificamos?
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="flex flex-col gap-3">
                    <Typography className="text-sm leading-relaxed">
                      Cada lance possui uma assinatura criptográfica ligada ao lance
                      anterior. O servidor confere essa sequência e o estado do
                      leilão para detectar alterações. A verificação cobre todo
                      o histórico, não apenas esta página.
                    </Typography>
                    <Typography className="text-sm leading-relaxed text-muted">
                      Os participantes usam identificadores públicos. A
                      verificação é realizada pelo servidor, não é uma
                      certificação externa e não protege contra comprometimento
                      da chave ou restauração integral de um snapshot válido.
                    </Typography>
                    <Card.Description>Código de verificação</Card.Description>
                    <Typography className="text-xs leading-relaxed text-muted">
                      Assinatura usada pelo servidor para conferir os dados do
                      leilão, incluindo a quantidade de lances e o último registro.
                    </Typography>
                    <Typography.Code className="block max-w-full break-all whitespace-normal text-xs">
                      {dados.checkpoint}
                    </Typography.Code>
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </>
        )}
      </Card>
    </Card>
  );
}
