"use client";
import { Button, Card, Chip, Form, Tabs, Typography } from "@heroui/react";
import { CampoMoeda } from "@/componentes/ui/campo-moeda";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { formatarReais } from "@/lib/formatacao";
import { FormularioCartao } from "./formulario-cartao";
import { PainelPix } from "./painel-pix";
import { useDeposito } from "./use-deposito";
export function DepositarSaldo({
  usuarioId,
  atualizar,
}: {
  usuarioId: string;
  atualizar: () => Promise<unknown>;
}) {
  const {
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
  } = useDeposito(usuarioId, atualizar);
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
      {confirmado && (
        <Aviso sucesso>
          Depósito confirmado. Você já pode adicionar mais saldo.
        </Aviso>
      )}
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
                <Typography>QR Code e confirmação em 5 segundos.</Typography>
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
              Adicionar novo saldo
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
