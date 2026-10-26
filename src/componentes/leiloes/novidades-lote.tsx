"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Button,
  Card,
  Link,
  Modal,
  Typography,
  buttonVariants,
} from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import {
  consultarNovidadesAcao,
  salvarNovidadesAcao,
} from "@/servidor/actions/novidades";

import { CanaisNovidades } from "./canais-novidades";
import {
  preferenciasVazias as vazio,
  errosContatosNovidades,
  type PreferenciasNovidades as Preferencias,
} from "@/lib/preferencias-novidades";
export function NovidadesLote({
  loteId,
  usuarioId,
}: {
  loteId: string;
  usuarioId?: string;
}) {
  const [aberto, definirAberto] = useState(false);
  const [escolhas, definirEscolhas] = useState<Preferencias | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [mensagem, definirMensagem] = useState("");
  const [sucesso, definirSucesso] = useState(false);
  const [mostrarErros, definirMostrarErros] = useState(false);
  const recurso = useSWR(
    aberto && usuarioId ? ["novidades", loteId, usuarioId] : null,
    async () => {
      const resultado = await consultarNovidadesAcao(loteId);
      if (!resultado.success) throw new Error(resultado.error);
      return resultado.data;
    },
    { revalidateOnFocus: false },
  );
  const preferencias = escolhas ?? recurso.data ?? vazio;
  async function salvar() {
    definirMostrarErros(true);
    if (Object.values(errosContatosNovidades(preferencias)).some(Boolean))
      return;
    definirSalvando(true);
    definirMensagem("");
    definirSucesso(false);
    try {
      const resultado = await salvarNovidadesAcao({ loteId, ...preferencias });
      if (!resultado.success) {
        definirMensagem(resultado.error);
        return;
      }
      await recurso.mutate(resultado.data, false);
      definirEscolhas(resultado.data);
      definirSucesso(true);
      definirMensagem(
        preferencias.whatsapp || preferencias.telegram || preferencias.email
          ? "Preferências salvas para este leilão."
          : "Preferências removidas para este leilão.",
      );
    } catch {
      definirMensagem("Não foi possível salvar. Tente novamente.");
    } finally {
      definirSalvando(false);
    }
  }
  return (
    <>
      <Button
        variant="primary"
        className="min-h-10 w-fit max-w-full self-start gap-2 px-4 text-sm"
        onPress={() => {
          definirEscolhas(null);
          definirMostrarErros(false);
          definirMensagem("");
          definirAberto(true);
        }}
      >
        <Icone nome="email" />
        Quero receber novidades
      </Button>
      <Modal
        isOpen={aberto}
        onOpenChange={(valor) => {
          if (!salvando) definirAberto(valor);
        }}
      >
        <Modal.Backdrop>
          <Modal.Container size="sm" scroll="inside">
            <Modal.Dialog>
              <Modal.CloseTrigger
                aria-label="Fechar novidades"
                isDisabled={salvando}
              >
                <Icone nome="fechar" />
              </Modal.CloseTrigger>
              <Modal.Header className="gap-2 pr-10">
                <Modal.Heading>Novidades deste leilão</Modal.Heading>
                <Card.Description>
                  Escolha os canais de sua preferência.
                </Card.Description>
              </Modal.Header>
              <Modal.Body className="gap-4">
                {usuarioId ? (
                  <>
                    <CanaisNovidades
                      preferencias={preferencias}
                      mostrarErros={mostrarErros}
                      desabilitado={
                        recurso.isLoading || !!recurso.error || salvando
                      }
                      aoAlterar={(valor) => {
                        definirEscolhas(valor);
                        definirMensagem("");
                      }}
                    />
                    {recurso.isLoading && (
                      <Typography className="text-sm text-muted">
                        Carregando preferências…
                      </Typography>
                    )}
                    {recurso.error && (
                      <Aviso>
                        Não foi possível carregar suas preferências.
                      </Aviso>
                    )}
                  </>
                ) : (
                  <Typography>
                    Entre na sua conta para salvar suas preferências.
                  </Typography>
                )}
                <Card
                  variant="secondary"
                  className="flex-row items-start gap-2 p-3"
                >
                  <Icone nome="informacao" />
                  <Typography className="text-xs text-muted">
                    Modo de teste · Sem envio de mensagens.
                  </Typography>
                </Card>
                {mensagem && <Aviso sucesso={sucesso}>{mensagem}</Aviso>}
              </Modal.Body>
              <Modal.Footer className="gap-2">
                <Button
                  variant="secondary"
                  isDisabled={salvando}
                  onPress={() => definirAberto(false)}
                >
                  Fechar
                </Button>
                {usuarioId ? (
                  <Button
                    onPress={salvar}
                    isPending={salvando}
                    isDisabled={
                      recurso.isLoading || !!recurso.error || !recurso.data
                    }
                  >
                    Salvar preferências
                  </Button>
                ) : (
                  <Link
                    href={`/entrar?retorno=${encodeURIComponent(`/lotes/${loteId}`)}`}
                    className={buttonVariants({ variant: "primary" })}
                  >
                    Entrar
                  </Link>
                )}
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
