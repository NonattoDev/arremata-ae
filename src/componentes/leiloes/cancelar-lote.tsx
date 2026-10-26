"use client";

import { useState } from "react";
import { Button, Modal, Typography } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { executarAcao } from "@/lib/executar-acao";
import { cancelarLoteAcao } from "@/servidor/actions/lotes";
import type { Lote } from "@/tipos/leilao";

export function CancelarLote({
  lote,
  aoCancelar,
}: {
  lote: Lote;
  aoCancelar: () => Promise<unknown>;
}) {
  const [aberto, definirAberto] = useState(false);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState("");
  async function confirmar() {
    if (ocupado) return;
    definirOcupado(true);
    definirErro("");
    try {
      await executarAcao(() => cancelarLoteAcao(lote.id));
      await aoCancelar();
      definirAberto(false);
    } catch (falha) {
      definirErro((falha as Error).message);
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <>
      <Button size="sm" variant="ghost" onPress={() => definirAberto(true)}>
        <Icone nome="cancelar" />
        Cancelar lote
      </Button>
      <Modal
        isOpen={aberto}
        onOpenChange={(valor) => {
          if (!ocupado) definirAberto(valor);
        }}
      >
        <Modal.Backdrop>
          <Modal.Container size="sm" scroll="inside">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Cancelar este lote?</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <Typography.Paragraph>{lote.item.title}</Typography.Paragraph>
                <Typography.Paragraph>
                  O lote sairá da vitrine e não aceitará novos lances. Qualquer
                  saldo reservado será liberado automaticamente. O histórico
                  será preservado.
                </Typography.Paragraph>
                {erro && <Aviso>{erro}</Aviso>}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  isDisabled={ocupado}
                  onPress={() => definirAberto(false)}
                >
                  Manter leilão
                </Button>
                <Button
                  variant="danger"
                  isPending={ocupado}
                  onPress={confirmar}
                >
                  Confirmar cancelamento
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
