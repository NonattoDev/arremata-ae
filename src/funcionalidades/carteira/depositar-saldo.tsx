"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import useSWR, { useSWRConfig } from "swr";
import { Button, Card, Chip, Form, Tabs, Typography } from "@heroui/react";
import { CampoMoeda } from "@/componentes/ui/campo-moeda";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { executarAcao } from "@/lib/executar-acao";
import { formatarReais } from "@/lib/formatacao";
import { validarCartaoTeste } from "@/lib/cartao-teste";
import {
  iniciarDepositoAcao,
  acompanharDepositoAcao,
  cancelarDepositoAcao,
} from "@/servidor/actions/depositos";
import { FormularioCartao, cartaoVazio } from "./formulario-cartao";
import { PainelPix } from "./painel-pix";
import type { DepositoSimulado } from "@/tipos/deposito";
const intervaloConsulta = (dados?: DepositoSimulado) =>
  dados && dados.estado !== "pending" ? 0 : 2000;
export function DepositarSaldo({
  usuarioId,
  atualizar,
}: {
  usuarioId: string;
  atualizar: () => Promise<unknown>;
}) {
  const { mutate } = useSWRConfig();
  const [metodo, definirMetodo] = useState("pix");
  const [valor, definirValor] = useState(10000);
  const [cartao, definirCartao] = useState(cartaoVazio);
  const [id, definirId] = useState<string | null>(null);
  const [erro, definirErro] = useState("");
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
      notificado.current !== deposito.id
    ) {
      notificado.current = deposito.id;
      void atualizar();
      void mutate(
        (chave) =>
          Array.isArray(chave) &&
          chave[0] === "comprovantes-deposito" &&
          chave[1] === usuarioId,
      );
    }
  }, [deposito, atualizar, mutate, usuarioId]);
  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    definirErro("");
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
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <Card.Header className="gap-2">
        <Chip size="sm" color="accent">
          Ambiente de simulação
        </Chip>
        <Card.Title className="flex items-center gap-2 text-xl">
          <Icone nome="adicionar" />
          Adicionar saldo
        </Card.Title>
        <Card.Description>
          Nenhuma cobrança real. Escolha como deseja testar o depósito.
        </Card.Description>
      </Card.Header>
      {!id ? (
        <Form onSubmit={enviar} className="flex flex-col gap-5">
          <CampoMoeda valor={valor} alterar={definirValor} disabled={ocupado} />
          <Card.Content className="flex-row flex-wrap gap-2">
            {[100, 500, 1000].map((n) => (
              <Button
                key={n}
                type="button"
                size="sm"
                variant="secondary"
                onPress={() => definirValor(n * 100)}
              >
                {formatarReais(n * 100)}
              </Button>
            ))}
          </Card.Content>
          <Tabs
            selectedKey={metodo}
            onSelectionChange={(chave) => definirMetodo(String(chave))}
          >
            <Tabs.ListContainer className="w-full">
              <Tabs.List
                aria-label="Método do depósito simulado"
                className="w-full"
              >
                <Tabs.Tab id="pix" className="flex-1 gap-2">
                  <Icone nome="qr" />
                  Pix
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="card" className="flex-1 gap-2">
                  <Icone nome="cartao" />
                  Cartão
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
            <Tabs.Panel id="pix">
              <Card variant="secondary" className="gap-2 p-4">
                <Icone nome="qr" className="text-accent" />
                <Typography>QR Code e confirmação em 30 segundos.</Typography>
                <Card.Description>
                  O saldo entra automaticamente ao concluir a simulação.
                </Card.Description>
              </Card>
            </Tabs.Panel>
            <Tabs.Panel id="card">
              <FormularioCartao
                dados={cartao}
                alterar={definirCartao}
                ocupado={ocupado}
              />
            </Tabs.Panel>
          </Tabs>
          <Button type="submit" isPending={ocupado}>
            <Icone nome={metodo === "pix" ? "qr" : "cartao"} />
            {metodo === "pix" ? "Gerar QR Code" : "Simular depósito"}
          </Button>
        </Form>
      ) : (
        <Card.Content className="gap-4">
          {deposito && (
            <Typography className="text-2xl font-semibold text-accent tabular-nums">
              {formatarReais(deposito.valor)}
            </Typography>
          )}
          {!deposito && !consulta.error && (
            <Typography role="status">Consultando depósito…</Typography>
          )}
          {deposito?.estado === "pending" &&
            (deposito.metodo === "pix" ? (
              <PainelPix
                id={deposito.id}
                segundos={Math.max(
                  0,
                  Math.ceil(
                    (new Date(deposito.disponivelEm).getTime() -
                      agora -
                      desvioRelogio.current) /
                      1000,
                  ),
                )}
              />
            ) : (
              <Typography role="status" className="flex items-center gap-2">
                <Icone nome="tempo" />
                Processando cartão de teste…
              </Typography>
            ))}
          {deposito?.estado === "confirmed" && (
            <Aviso sucesso>
              Depósito confirmado. O saldo já está disponível.
            </Aviso>
          )}
          {deposito && ["cancelled", "expired"].includes(deposito.estado) && (
            <Aviso>
              {deposito.estado === "expired"
                ? "A simulação expirou. Gere outra para continuar."
                : "Depósito cancelado. Nenhum valor adicionado."}
            </Aviso>
          )}
          {deposito?.estado === "pending" && (
            <Button variant="tertiary" onPress={cancelar} isPending={ocupado}>
              Cancelar depósito
            </Button>
          )}
          {((deposito && deposito.estado !== "pending") || consulta.error) && (
            <Button
              variant="secondary"
              onPress={() => {
                guardar(null);
                definirErro("");
              }}
            >
              Voltar
            </Button>
          )}
        </Card.Content>
      )}
      {(erro || consulta.error) && (
        <Aviso>{erro || consulta.error.message}</Aviso>
      )}
    </Card>
  );
}
