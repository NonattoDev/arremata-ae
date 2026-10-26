"use client";
import { useState } from "react";
import useSWR from "swr";
import { Button, Card, Chip, Link, Typography } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { executarAcao } from "@/lib/executar-acao";
import { formatarReais, formatarDataHora } from "@/lib/formatacao";
import { listarComprovantesDepositoAcao } from "@/servidor/actions/depositos";

export function ComprovantesDeposito({
  usuarioId,
  resumo = false,
}: {
  usuarioId: string;
  resumo?: boolean;
}) {
  const [pagina, definirPagina] = useState(1);
  const consulta = useSWR(["comprovantes-deposito", usuarioId, pagina], () =>
    executarAcao(() => listarComprovantesDepositoAcao(pagina)),
  );
  const itens = resumo
    ? consulta.data?.comprovantes.slice(0, 3)
    : consulta.data?.comprovantes;
  return (
    <Card className="min-w-0 gap-5 p-5 sm:p-6">
      <Card.Header className="flex-row flex-wrap items-center justify-between gap-3">
        <Typography.Heading
          level={resumo ? 2 : 1}
          className="flex items-center gap-2 text-xl"
        >
          <Icone nome="comprovante" className="text-accent" />
          {resumo ? "Últimos depósitos" : "Comprovantes de depósito"}
        </Typography.Heading>
        <Link
          href={resumo ? "/carteira/comprovantes" : "/carteira"}
          className="text-accent"
        >
          {resumo ? "Ver todos os comprovantes" : "Voltar à carteira"}
        </Link>
      </Card.Header>
      <Card.Description>
        Depósitos simulados confirmados na sua conta.
      </Card.Description>
      {consulta.error && <Aviso>{consulta.error.message}</Aviso>}
      {consulta.isLoading && (
        <Typography role="status">Carregando comprovantes…</Typography>
      )}
      {itens?.length === 0 && (
        <Typography>Nenhum depósito confirmado ainda.</Typography>
      )}
      <Card.Content className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {itens?.map((item) => (
          <Card key={item.id} variant="secondary" className="min-w-0 gap-3 p-4">
            <Card.Header className="flex-row flex-wrap items-center justify-between gap-3">
              <Typography className="flex items-center gap-2 font-medium">
                <Icone
                  nome={item.metodo === "pix" ? "qr" : "cartao"}
                  className="text-accent"
                />
                {item.metodo === "pix" ? "Pix" : "Cartão"}
              </Typography>
              <Chip color="success" size="sm">
                Confirmado
              </Chip>
            </Card.Header>
            <Typography className="text-lg font-semibold text-accent tabular-nums">
              {formatarReais(item.valor)}
            </Typography>
            <Card.Description>
              {formatarDataHora(item.confirmadoEm)}
            </Card.Description>
            <Typography className="break-all text-xs text-muted">
              Identificação: {item.id}
            </Typography>
          </Card>
        ))}
      </Card.Content>
      {!resumo && (
        <Card.Footer className="flex-wrap justify-between gap-3">
          <Button
            variant="secondary"
            isDisabled={pagina === 1 || consulta.isLoading}
            onPress={() => definirPagina(pagina - 1)}
          >
            Anterior
          </Button>
          <Typography>Página {pagina}</Typography>
          <Button
            variant="secondary"
            isDisabled={!consulta.data?.temMais || consulta.isLoading}
            onPress={() => definirPagina(pagina + 1)}
          >
            Próxima
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}

