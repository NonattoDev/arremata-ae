"use client";
import { Icone } from "@/componentes/ui/icone";
import { executarAcao } from "@/lib/executar-acao";
import { depositarAcao } from "@/servidor/actions/carteira";

import { useState, type FormEvent } from "react";

import type { Usuario } from "@/tipos/leilao";
import { formatarReais } from "@/lib/formatacao";

import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Campo } from "@/componentes/ui/campo";
import { Button, Card, Form, Typography } from "@heroui/react";
export function PaginaCarteira({ usuario }: { usuario: Usuario }) {
  const recurso = useRecurso<{
    total: number;
    committed: number;
    available: number;
  }>("wallet", true);
  const [ocupado, definirOcupado] = useState(false),
    [erro, definirErro] = useState(""),
    [sucesso, definirSucesso] = useState("");
  const depositar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    definirOcupado(true);
    definirErro("");
    definirSucesso("");
    try {
      await executarAcao(() =>
        depositarAcao({
          amount: Math.round(
            Number(new FormData(formulario).get("amount")) * 100,
          ),
        }),
      );
      formulario.reset();
      definirSucesso("Saldo adicionado.");
      await recurso.atualizar();
    } catch (evento) {
      definirErro((evento as Error).message);
    } finally {
      definirOcupado(false);
    }
  };
  return (
    <Card className="gap-6 p-5 sm:p-8">
      <Typography.Heading level={1}>
        {usuario.role === "seller" ? "Recebimentos" : "Minha carteira"}
      </Typography.Heading>
      <Typography.Paragraph>
        {usuario.role === "seller"
          ? "Valores creditados pelos lotes arrematados."
          : "Consulte seu saldo e os valores reservados em lances."}
      </Typography.Paragraph>
      {recurso.erro && <Aviso>{recurso.erro}</Aviso>}
      <Card.Content className="grid min-w-0 gap-4 md:grid-cols-3">
        {[
          ["Saldo total", "total"],
          ["Saldo comprometido", "committed"],
          ["Saldo disponível", "available"],
        ].map(([rotulo, chave]) => (
          <Card key={chave} variant="secondary" className="gap-2 p-5">
            <Card.Description>{rotulo}</Card.Description>
            <Typography className="text-2xl font-semibold tabular-nums">
              {recurso.dados
                ? formatarReais(recurso.dados[chave as "total"])
                : "—"}
            </Typography>
          </Card>
        ))}
      </Card.Content>
      <Card.Content className="grid min-w-0 gap-6 lg:grid-cols-2">
        {usuario.role === "bidder" && (
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Card.Title>Adicionar saldo</Card.Title>
            <Typography.Paragraph>
              Depósito simulado. Nenhuma cobrança será realizada.
            </Typography.Paragraph>
            <Form onSubmit={depositar} className="flex flex-col gap-4">
              <Campo
                name="amount"
                label="Valor do depósito (R$)"
                type="number"
                min="0.01"
                max="10000000"
                step="0.01"
                placeholder="500,00"
                required
              />
              <Button type="submit" isPending={ocupado}>
                <Icone nome="adicionar" />
                Adicionar saldo
              </Button>
            </Form>
            {erro && <Aviso>{erro}</Aviso>}
            {sucesso && <Aviso sucesso>{sucesso}</Aviso>}
          </Card.Content>
        )}
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Card.Title>Como funciona a reserva de saldo</Card.Title>
          <Typography.Paragraph>
            Ao liderar um lote, o valor do lance fica comprometido. Se outra
            pessoa superar você, ele volta imediatamente ao disponível.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Quando o lote encerra, somente o vencedor é debitado. O leiloeiro
            recebe o mesmo valor.
          </Typography.Paragraph>
        </Card.Content>
      </Card.Content>
    </Card>
  );
}
