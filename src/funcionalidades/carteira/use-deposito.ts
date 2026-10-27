"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import useSWR, { useSWRConfig } from "swr";
import { toast } from "@heroui/react";
import { executarAcao } from "@/lib/executar-acao";
import { formatarReais } from "@/lib/formatacao";
import { validarCartaoTeste } from "@/lib/cartao-teste";
import {
  iniciarDepositoAcao,
  acompanharDepositoAcao,
  cancelarDepositoAcao,
} from "@/servidor/actions/depositos";
import { cartaoVazio } from "./formulario-cartao";
import type { DepositoSimulado } from "@/tipos/deposito";
const intervaloConsulta = (dados?: DepositoSimulado) =>
  dados && dados.estado !== "pending" ? 0 : 2000;
export function useDeposito(
  usuarioId: string,
  atualizar: () => Promise<unknown>,
) {
  const { mutate } = useSWRConfig();
  const [metodo, definirMetodo] = useState("pix");
  const [valor, definirValor] = useState(10000);
  const [cartao, definirCartao] = useState(cartaoVazio);
  const [id, definirId] = useState<string | null>(null);
  const [erro, definirErro] = useState("");
  const [confirmado, definirConfirmado] = useState(false);
  const [ocupado, definirOcupado] = useState(false);
  const [agora, definirAgora] = useState(Date.now());
  const notificado = useRef("");
  const desvioRelogio = useRef(0);
  const chave = `deposito-simulado:${usuarioId}`;
  useEffect(() => {
    try {
      definirId(localStorage.getItem(chave));
    } catch {}
  }, [chave]);
  const guardar = (novo: string | null) => {
    definirId(novo);
    try {
      if (novo) localStorage.setItem(chave, novo);
      else localStorage.removeItem(chave);
    } catch {}
  };
  const consulta = useSWR(
    id ? ["deposito", id] : null,
    async ([, codigo]) => {
      const resposta = await executarAcao(() => acompanharDepositoAcao(codigo));
      desvioRelogio.current = new Date(resposta.agora).getTime() - Date.now();
      return resposta;
    },
    {
      refreshInterval: intervaloConsulta,
      errorRetryCount: 2,
      refreshWhenHidden: true,
      revalidateOnFocus: true,
    },
  );
  const deposito = consulta.data;
  useEffect(() => {
    const timer = setInterval(() => definirAgora(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (
      deposito?.estado === "confirmed" &&
      deposito.id === id &&
      notificado.current !== deposito.id
    ) {
      notificado.current = deposito.id;
      toast.success("Depósito confirmado!", {
        description: `${formatarReais(deposito.valor)} já estão disponíveis na sua carteira.`,
        timeout: 5000,
      });
      definirConfirmado(true);
      definirId(null);
      try {
        localStorage.removeItem(chave);
      } catch {}
      void atualizar();
      void mutate(
        (chave) =>
          Array.isArray(chave) &&
          chave[0] === "comprovantes-deposito" &&
          chave[1] === usuarioId,
      );
    }
  }, [deposito, id, chave, atualizar, mutate, usuarioId]);
  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    definirErro("");
    definirConfirmado(false);
    if (metodo === "card") {
      const falha = validarCartaoTeste(
        cartao.nome,
        cartao.numero,
        cartao.validade,
        cartao.cvv,
      );
      if (falha) {
        definirErro(falha);
        return;
      }
    }
    definirOcupado(true);
    try {
      const novo = await executarAcao(() =>
        iniciarDepositoAcao({ valor, metodo }),
      );
      guardar(novo.id);
      definirCartao(cartaoVazio);
    } catch (falha) {
      definirErro((falha as Error).message);
    } finally {
      definirOcupado(false);
    }
  };
  const cancelar = async () => {
    if (!id) return;
    definirOcupado(true);
    try {
      const resultado = await executarAcao(() => cancelarDepositoAcao(id));
      await consulta.mutate(resultado, false);
    } catch (falha) {
      definirErro((falha as Error).message);
    } finally {
      definirOcupado(false);
    }
  };
  return {
    metodo,
    definirMetodo,
    valor,
    definirValor,
    cartao,
    definirCartao,
    id,
    erro,
    definirErro,
    confirmado,
    ocupado,
    agora,
    desvioRelogio,
    consulta,
    deposito,
    guardar,
    enviar,
    cancelar,
  };
}
