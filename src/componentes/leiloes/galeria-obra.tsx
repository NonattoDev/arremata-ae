"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Link, Modal, buttonVariants } from "@heroui/react";
import type { Lote } from "@/tipos/leilao";
import { Icone } from "@/componentes/ui/icone";
import { FichaAcervo } from "./ficha-acervo";
import { ImagemObra } from "./imagem-obra";
import { HistoriaObra } from "./historia-obra";

export function GaleriaObra({
  lote,
  className = "aspect-[4/3] max-h-80 p-6 pt-14",
  destaque = false,
  aoMudarAbertura,
}: {
  lote: Lote;
  className?: string;
  destaque?: boolean;
  aoMudarAbertura?: (aberta: boolean) => void;
}) {
  const [aberta, definirAberta] = useState(false);
  const navegacao = useRouter();
  function mudarAbertura(valor: boolean) {
    definirAberta(valor);
    aoMudarAbertura?.(valor);
  }
  return (
    <>
      <Button
        variant="ghost"
        aria-label={`Ampliar obra: ${lote.item.title}`}
        className={`relative flex h-auto w-full min-w-0 items-center justify-center overflow-hidden rounded-none ${className}`}
        onPress={() => {
          mudarAbertura(true);
        }}
      >
        <ImagemObra
          src={lote.item.image}
          alt={lote.item.title}
          preencher
          destaque={destaque}
        />
      </Button>
      <Modal isOpen={aberta} onOpenChange={mudarAbertura}>
        <Modal.Backdrop>
          <Modal.Container size="lg" scroll="inside">
            <Modal.Dialog className="max-w-5xl">
              <Modal.CloseTrigger aria-label="Fechar galeria">
                <Icone nome="fechar" />
              </Modal.CloseTrigger>
              <Modal.Header className="pr-10">
                <Modal.Heading>{lote.item.title}</Modal.Heading>
                <Card.Description>
                  {lote.item.artist} · {lote.item.date}
                </Card.Description>
              </Modal.Header>
              <Modal.Body className="gap-4">
                <FichaAcervo
                  galeria
                  identificador={lote.item.externalId}
                  key={String(aberta)}
                  imagem={lote.item.image}
                  titulo={lote.item.title}
                />
                <HistoriaObra identificador={lote.item.externalId} />
              </Modal.Body>
              <Modal.Footer className="flex-wrap items-center justify-between gap-3">
                <Link
                  href={lote.item.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icone nome="externo" />
                  Consultar obra no museu
                </Link>
                <Button
                  variant="secondary"
                  onPress={() => mudarAbertura(false)}
                >
                  Voltar
                </Button>
                {lote.status === "live" && (
                  <Link
                    href={`/lotes/${lote.id}`}
                    onPress={() => {
                      navegacao.push(`/lotes/${lote.id}`);
                      mudarAbertura(false);
                    }}
                    className={buttonVariants({ variant: "primary" })}
                  >
                    Ir para o leilão <Icone nome="seta" />
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
