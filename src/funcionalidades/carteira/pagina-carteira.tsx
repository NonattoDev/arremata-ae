"use client";
import type { Usuario } from "@/tipos/leilao";
import { formatarReais } from "@/lib/formatacao";
import { useRecurso } from "@/hooks/use-recurso";
import { Aviso } from "@/componentes/ui/aviso";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";
import { Card, Typography } from "@heroui/react";
import { DepositarSaldo } from "./depositar-saldo";
import { AjudaReservaSaldo } from "./ajuda-reserva-saldo";
import { ComprovantesDeposito } from "./comprovantes-deposito";
const saldos: {
  rotulo: string;
  chave: "available" | "committed" | "total";
  icone: NomeIcone;
  cor: string;
}[] = [
  {
    rotulo: "Disponível para lances",
    chave: "available",
    icone: "carteira",
    cor: "bg-accent-soft text-accent",
  },
  {
    rotulo: "Reservado nos leilões",
    chave: "committed",
    icone: "senha",
    cor: "bg-warning-soft text-warning",
  },
  {
    rotulo: "Saldo total",
    chave: "total",
    icone: "pagamento",
    cor: "bg-success-soft text-success",
  },
];
export function PaginaCarteira({ usuario }: { usuario: Usuario }) {
  const recurso = useRecurso<{
    total: number;
    committed: number;
    available: number;
  }>("wallet", true);
  return (
    <Card variant="transparent" className="gap-6">
      <Card.Header className="gap-2">
        <Typography.Heading level={1} className="flex items-center gap-3">
          <Icone nome="carteira" className="text-accent" />
          {usuario.role === "seller" ? "Recebimentos" : "Minha carteira"}
        </Typography.Heading>
        <Card.Description>
          Seu saldo, suas reservas e seus próximos lances.
        </Card.Description>
      </Card.Header>
      {recurso.erro && <Aviso>{recurso.erro}</Aviso>}
      <Card.Content className="grid min-w-0 gap-3 sm:grid-cols-3">
        {saldos.map((item) => (
          <Card key={item.chave} className="gap-3 p-5">
            <Card.Content className={`w-fit rounded-xl p-3 ${item.cor}`}>
              <Icone nome={item.icone} />
            </Card.Content>
            <Card.Description>{item.rotulo}</Card.Description>
            <Typography className="text-xl font-semibold tabular-nums">
              {recurso.dados ? formatarReais(recurso.dados[item.chave]) : "—"}
            </Typography>
          </Card>
        ))}
      </Card.Content>
      <Card.Content className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
        {usuario.role === "bidder" && (
          <DepositarSaldo
            usuarioId={usuario.id}
            atualizar={recurso.atualizar}
          />
        )}
        <AjudaReservaSaldo />
      </Card.Content>
      {usuario.role === "bidder" && (
        <ComprovantesDeposito usuarioId={usuario.id} resumo />
      )}
    </Card>
  );
}
