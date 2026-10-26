"use client";
import { useState } from "react";
import { Button, Card, Form, Modal } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { CampoCpf } from "@/componentes/ui/campo-cpf";
import { CampoNascimento } from "@/componentes/ui/campo-nascimento";
import { Icone } from "@/componentes/ui/icone";
import { Aviso } from "@/componentes/ui/aviso";
import { validarCpf } from "@/lib/cpf";
import { validarNascimento } from "@/lib/dados-participacao";
import { executarAcao } from "@/lib/executar-acao";
import { completarCadastroAcao } from "@/servidor/actions/perfil";
import type { Usuario } from "@/tipos/leilao";

const DialogoAnimado = motion.create(Modal.Dialog);

export function CompletarCadastroModal({
  usuario,
  aoFechar,
  aoSalvar,
}: {
  usuario: Usuario;
  aoFechar: () => void;
  aoSalvar: () => Promise<void>;
}) {
  const reduzirMovimento = useReducedMotion();
  const [cpf, definirCpf] = useState(usuario.cpf ?? "");
  const [nascimento, definirNascimento] = useState(usuario.nascimento ?? "");
  const [tentativa, definirTentativa] = useState(0);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState("");
  async function salvar() {
    definirTentativa((valor) => valor + 1);
    if (!validarCpf(cpf) || !validarNascimento(nascimento)) return;
    definirOcupado(true);
    definirErro("");
    try {
      await executarAcao(() => completarCadastroAcao({ cpf, nascimento }));
      await aoSalvar();
      aoFechar();
    } catch (falha) {
      definirErro((falha as Error).message);
    } finally {
      definirOcupado(false);
    }
  }
  return (
    <Modal
      isOpen
      onOpenChange={(aberto) => {
        if (!aberto && !ocupado) aoFechar();
      }}
    >
      <Modal.Backdrop>
        <Modal.Container size="sm" scroll="inside">
          <DialogoAnimado
            initial={{ x: 0 }}
            animate={{ x: reduzirMovimento ? 0 : [0, -9, 9, -7, 7, -3, 3, 0] }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
          >
            <Modal.CloseTrigger
              isDisabled={ocupado}
              aria-label="Fechar cadastro"
            >
              <Icone nome="fechar" />
            </Modal.CloseTrigger>
            <Modal.Header className="gap-2 pr-8">
              <Modal.Heading>Complete seu cadastro</Modal.Heading>
              <Card.Description>
                Para dar lances, informe seu CPF e sua data de nascimento.
              </Card.Description>
            </Modal.Header>
            <Modal.Body>
              <Form
                className="flex flex-col gap-4"
                onSubmit={(evento) => {
                  evento.preventDefault();
                  void salvar();
                }}
              >
                <CampoCpf
                  valor={cpf}
                  aoAlterar={definirCpf}
                  tentativa={tentativa}
                  desabilitado={!!usuario.cpf || ocupado}
                  erro={
                    tentativa && !validarCpf(cpf)
                      ? "Informe um CPF válido."
                      : undefined
                  }
                />
                <CampoNascimento
                  valor={nascimento}
                  aoAlterar={definirNascimento}
                  desabilitado={!!usuario.nascimento || ocupado}
                  erro={
                    tentativa && !validarNascimento(nascimento)
                      ? "Informe uma data válida, anterior a hoje."
                      : undefined
                  }
                />
                <Card.Description className="text-xs">
                  Confira antes de salvar. Alterações posteriores pelo suporte.
                </Card.Description>
                {erro && <Aviso>{erro}</Aviso>}
                <Button type="submit" isPending={ocupado} fullWidth>
                  <Icone nome="confirmar" />
                  Salvar e continuar
                </Button>
              </Form>
            </Modal.Body>
          </DialogoAnimado>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
