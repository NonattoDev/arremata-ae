"use client";

import { useState, type FormEvent } from "react";
import {
  Button,
  Card,
  Form,
  Link,
  Typography,
  buttonVariants,
} from "@heroui/react";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
import { executarAcao } from "@/lib/executar-acao";
import { darLanceAcao } from "@/servidor/actions/lotes";
import { useRecurso } from "@/hooks/use-recurso";
import { Campo } from "@/componentes/ui/campo";
import { Aviso } from "@/componentes/ui/aviso";
import { Icone } from "@/componentes/ui/icone";
import { formatarReais } from "@/lib/formatacao";
import type { Sala } from "@/tipos/leilao";
import { cadastroCompleto } from "@/lib/dados-participacao";
import { CompletarCadastroModal } from "@/funcionalidades/perfil/completar-cadastro-modal";
export function FormularioLance({
  lote,
  atualizar,
  erroConsulta,
}: {
  lote: Sala;
  atualizar: () => Promise<void>;
  erroConsulta: string;
}) {
  const sessao = useSessao();
  const usuario = sessao.dados?.user;
  const [completar, definirCompletar] = useState(false);
  const id = lote.id;
  const minimo = lote.bidCount
    ? lote.currentAmount + lote.increment
    : lote.initial;
  const carteira = useRecurso<{ available: number }>(
    usuario?.role === "bidder" ? "wallet" : null,
    true,
  );
  const [valor, definirValor] = useState(""),
    [mensagem, definirMensagem] = useState(""),
    [erro, definirErro] = useState(""),
    [ocupado, definirOcupado] = useState(false);
  const enviarLance = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!cadastroCompleto(usuario)) {
      definirCompletar(true);
      return;
    }
    definirOcupado(true);
    definirMensagem("");
    definirErro("");
    try {
      await executarAcao(() =>
        darLanceAcao(id, {
          amount: Math.round(Number(valor || minimo / 100) * 100),
        }),
      );
      definirMensagem("Lance aceito! Acompanhe a disputa.");
      definirValor("");
      await Promise.all([atualizar(), carteira.atualizar()]);
    } catch (falha) {
      definirErro((falha as Error).message);
      await atualizar();
    } finally {
      definirOcupado(false);
    }
  };
  return (
    <>
      <Form onSubmit={enviarLance} className="flex flex-col gap-4">
        <Campo
          name="amount"
          label="Seu lance (R$)"
          type="number"
          inputMode="decimal"
          min={minimo / 100}
          step="0.01"
          value={valor}
          placeholder={(minimo / 100).toFixed(2)}
          onChange={(evento) => definirValor(evento.target.value)}
          disabled={lote.isLeader}
        />
        <Card.Content className="flex min-w-0 flex-row flex-wrap justify-between gap-2">
          <Typography className="text-sm">
            Mínimo: {formatarReais(minimo)}
          </Typography>
          <Typography className="text-sm">
            Incremento: {formatarReais(lote.increment)}
          </Typography>
        </Card.Content>
        <Button
          type="submit"
          className="bg-[#a94328] text-white hover:bg-[#89351f]"
          fullWidth
          size="lg"
          isPending={ocupado}
          isDisabled={lote.isLeader || !!erroConsulta}
        >
          <Icone nome={lote.isLeader ? "confirmar" : "leilao"} />
          {lote.isLeader ? "Você está na liderança" : "Confirmar lance"}
        </Button>
        <Card.Content className="flex-row flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-secondary/60 p-3">
          <Card.Content className="flex-none gap-1 p-0">
            <Card.Description className="text-xs">
              Saldo disponível
            </Card.Description>
            <Typography className="text-base font-semibold tabular-nums">
              {carteira.dados ? formatarReais(carteira.dados.available) : "…"}
            </Typography>
          </Card.Content>
          <Link
            href="/carteira"
            className={buttonVariants({
              variant: "secondary",
              size: "sm",
              className: "min-h-11 gap-2 text-blue-800 dark:text-blue-200",
            })}
          >
            <Icone nome="adicionar" />
            Adicionar saldo
          </Link>
        </Card.Content>
      </Form>
      {erro && <Aviso>{erro}</Aviso>}
      {mensagem && <Aviso sucesso>{mensagem}</Aviso>}
      {completar && usuario && (
        <CompletarCadastroModal
          usuario={usuario}
          aoFechar={() => definirCompletar(false)}
          aoSalvar={async () => {
            await sessao.atualizar();
            definirMensagem(
              "Cadastro completo! Confira o valor e confirme seu lance.",
            );
          }}
        />
      )}
    </>
  );
}
