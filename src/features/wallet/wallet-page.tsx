"use client";
import { runAction } from "@/lib/run-action";
import { depositAction } from "@/server/actions/wallet";

import { useState, type FormEvent } from "react";

import { Button } from "@heroui/react";
import { ShieldCheck, Wallet, Plus } from "lucide-react";

import type { User } from "@/types/auction";
import { brl } from "@/lib/format";

import { useResource } from "@/hooks/use-resource";
import { Notice } from "@/components/ui/notice";
import { Field } from "@/components/ui/field";
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
    <section className="page">
      <span className="eyebrow">TUDO SOB CONTROLE</span>
      <h1>
        {user.role === "seller"
          ? "Seus recebimentos."
          : "Sua próxima conquista começa aqui."}
      </h1>
      <p className="lead">
        {user.role === "seller"
          ? "Valores creditados pelos lotes arrematados."
          : "Adicione saldo simulado e entre na disputa pelas suas obras favoritas."}
      </p>
      {resource.error && <Notice>{resource.error}</Notice>}
      <div className="balance-grid">
        {[
          ["Saldo total", "total"],
          ["Saldo comprometido", "committed"],
          ["Saldo disponível", "available"],
        ].map(([label, key]) => (
          <div
            className={`balance-card ${key === "available" ? "highlight" : ""}`}
            key={key}
          >
            <Wallet size={22} />
            <span>{label}</span>
            <strong>
              {resource.data ? brl(resource.data[key as "total"]) : "—"}
            </strong>
          </div>
        ))}
      </div>
      <div className="wallet-bottom">
        {user.role === "bidder" && (
          <div className="panel">
            <h2>Um impulso para o próximo lance.</h2>
            <p>Depósito simulado. Nenhuma cobrança será realizada.</p>
            <form onSubmit={deposit}>
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
              <Button type="submit" className="orange-button" isPending={busy}>
                <Plus size={18} />
                Adicionar saldo
              </Button>
            </form>
            {error && <Notice>{error}</Notice>}
            {success && <Notice good>{success}</Notice>}
          </div>
        )}
        <div className="wallet-explanation">
          <ShieldCheck size={30} />
          <h2>Seu saldo acompanha a disputa.</h2>
          <p>
            Ao liderar um lote, o valor do lance fica comprometido. Se outra
            pessoa superar você, ele volta imediatamente ao disponível.
          </p>
          <p>
            Quando o lote encerra, somente o vencedor é debitado. O leiloeiro
            recebe o mesmo valor.
          </p>
        </div>
      </div>
    </section>
  );
}
