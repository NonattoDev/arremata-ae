"use client";
import { runAction } from "@/lib/run-action";
import { depositAction } from "@/server/actions/wallet";

import { useState, type FormEvent } from "react";

import type { User } from "@/types/auction";
import { brl } from "@/lib/format";

import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Field } from "@/components/ui/field";
import { Button, Card, Form, Typography } from "@heroui/react";
export function WalletPage({ user }: { user: User }) {
  const resource = useResource<{
    total: number;
    committed: number;
    available: number;
  }>("wallet", true);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const deposit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await runAction(() =>
        depositAction({
          amount: Math.round(Number(new FormData(form).get("amount")) * 100),
        }),
      );
      form.reset();
      setSuccess("Saldo simulado adicionado à sua carteira.");
      await resource.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <Typography>TUDO SOB CONTROLE</Typography>
      <Typography.Heading level={1}>
        {user.role === "seller"
          ? "Seus recebimentos."
          : "Sua próxima conquista começa aqui."}
      </Typography.Heading>
      <Typography.Paragraph>
        {user.role === "seller"
          ? "Valores creditados pelos lotes arrematados."
          : "Adicione saldo simulado e entre na disputa pelas suas obras favoritas."}
      </Typography.Paragraph>
      {resource.error && <Notice>{resource.error}</Notice>}
      <Card.Content className="grid min-w-0 gap-4 md:grid-cols-3">
        {[
          ["Saldo total", "total"],
          ["Saldo comprometido", "committed"],
          ["Saldo disponível", "available"],
        ].map(([label, key]) => (
          <Card.Content key={key}>
            <Typography>{label}</Typography>
            <Typography>
              {resource.data ? brl(resource.data[key as "total"]) : "—"}
            </Typography>
          </Card.Content>
        ))}
      </Card.Content>
      <Card.Content className="grid min-w-0 gap-6 lg:grid-cols-2">
        {user.role === "bidder" && (
          <Card.Content className="flex min-w-0 flex-col gap-4">
            <Card.Title>Um impulso para o próximo lance.</Card.Title>
            <Typography.Paragraph>
              Depósito simulado. Nenhuma cobrança será realizada.
            </Typography.Paragraph>
            <Form onSubmit={deposit} className="flex flex-col gap-4">
              <Field
                name="amount"
                label="Valor do depósito (R$)"
                type="number"
                min="0.01"
                max="10000000"
                step="0.01"
                placeholder="500,00"
                required
              />
              <Button type="submit" isPending={busy}>
                Adicionar saldo
              </Button>
            </Form>
            {error && <Notice>{error}</Notice>}
            {success && <Notice good>{success}</Notice>}
          </Card.Content>
        )}
        <Card.Content className="flex min-w-0 flex-col gap-4">
          <Card.Title>Seu saldo acompanha a disputa.</Card.Title>
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
