"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { Avatar, Button, Card, Input, Label, Typography } from "@heroui/react";
import {
  ajusteInicial,
  recortarFoto,
  type AjusteFoto,
} from "@/lib/recortar-foto";
import { salvarFotoPerfilAcao } from "@/servidor/actions/perfil";
import { ControleCorte } from "./controle-corte";
import { Icone } from "@/componentes/ui/icone";

export function EditorFoto({
  aoSalvar,
  aoEditar,
  ocupado,
}: {
  aoSalvar: (foto: string) => Promise<void>;
  aoEditar: (editando: boolean) => void;
  ocupado: boolean;
}) {
  const [imagem, definirImagem] = useState<ImageBitmap | null>(null);
  const [ajuste, ajustar] = useState(ajusteInicial);
  const [previa, definirPrevia] = useState("");
  const [mensagem, informar] = useState("");
  const [salvando, iniciar] = useTransition();
  const arquivo = useRef<HTMLInputElement>(null);
  const versao = useRef(0);
  const arraste = useRef<{ x: number; y: number; ajuste: AjusteFoto } | null>(
    null,
  );
  useEffect(() => () => imagem?.close(), [imagem]);
  useEffect(() => () => aoEditar(false), [aoEditar]);
  useEffect(() => {
    aoEditar(Boolean(imagem) || salvando);
  }, [imagem, salvando, aoEditar]);
  useEffect(() => {
    if (imagem) definirPrevia(recortarFoto(imagem, ajuste));
  }, [imagem, ajuste]);
  useEffect(
    () => () => {
      versao.current++;
    },
    [],
  );

  async function selecionar(foto?: File) {
    if (!foto) return;
    const atual = ++versao.current;
    informar("");
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(foto.type) ||
      foto.size > 8 * 1024 * 1024
    ) {
      informar("Escolha uma foto JPG, PNG ou WebP de até 8 MB.");
      return;
    }
    try {
      const nova = await createImageBitmap(foto);
      if (atual !== versao.current) {
        nova.close();
        return;
      }
      if (nova.width * nova.height > 24_000_000) {
        nova.close();
        throw new Error();
      }
      ajustar(ajusteInicial);
      definirImagem(nova);
    } catch {
      informar(
        "Não foi possível abrir esta imagem. Use uma foto de até 24 megapixels.",
      );
    }
  }
  function cancelar() {
    versao.current++;
    definirImagem(null);
    definirPrevia("");
    informar("");
    if (arquivo.current) arquivo.current.value = "";
  }
  function salvar() {
    iniciar(async () => {
      informar("");
      const resultado = await salvarFotoPerfilAcao(previa);
      if (!resultado.success) {
        informar(resultado.error);
        return;
      }
      await aoSalvar(resultado.data.avatar);
      cancelar();
      informar("Foto salva!");
    });
  }
  return (
    <Card variant="secondary" className="gap-4 p-4">
      <Card.Title>Sua foto</Card.Title>
      <Card.Content className="gap-2">
        <Label htmlFor="foto-perfil">Enviar uma foto</Label>
        <Input
          ref={arquivo}
          id="foto-perfil"
          disabled={salvando || ocupado}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full min-w-0 text-sm"
          onChange={(evento) => void selecionar(evento.target.files?.[0])}
        />
      </Card.Content>
      <Card.Description>JPG, PNG ou WebP · até 8 MB</Card.Description>
      {imagem && (
        <>
          <Card.Content className="items-center gap-3">
            <Avatar
              className="size-56 max-w-full touch-none select-none"
              aria-label="Prévia do corte. Arraste para ajustar ou use os controles abaixo."
              onPointerDown={(evento) => {
                if (salvando) return;
                evento.currentTarget.setPointerCapture(evento.pointerId);
                arraste.current = {
                  x: evento.clientX,
                  y: evento.clientY,
                  ajuste,
                };
              }}
              onPointerMove={(evento) => {
                const inicio = arraste.current;
                if (!inicio || salvando) return;
                const largura =
                  evento.currentTarget.getBoundingClientRect().width;
                const limitar = (valor: number) =>
                  Math.max(-100, Math.min(100, valor));
                ajustar({
                  ...inicio.ajuste,
                  horizontal: limitar(
                    inicio.ajuste.horizontal -
                      ((evento.clientX - inicio.x) / largura) * 200,
                  ),
                  vertical: limitar(
                    inicio.ajuste.vertical -
                      ((evento.clientY - inicio.y) / largura) * 200,
                  ),
                });
              }}
              onPointerUp={() => {
                arraste.current = null;
              }}
              onPointerCancel={() => {
                arraste.current = null;
              }}
              onLostPointerCapture={() => {
                arraste.current = null;
              }}
            >
              <Avatar.Image
                src={previa || undefined}
                alt="Prévia da sua foto"
                draggable={false}
              />
            </Avatar>
            <Typography className="text-sm">
              Arraste a foto para ajustar o corte.
            </Typography>
          </Card.Content>
          <ControleCorte
            rotulo="Zoom"
            valor={ajuste.zoom}
            minimo={1}
            maximo={3}
            passo={0.05}
            desabilitado={salvando}
            alterar={(zoom) => ajustar((atual) => ({ ...atual, zoom }))}
          />
          <ControleCorte
            rotulo="Posição horizontal"
            valor={ajuste.horizontal}
            desabilitado={salvando}
            alterar={(horizontal) =>
              ajustar((atual) => ({ ...atual, horizontal }))
            }
          />
          <ControleCorte
            rotulo="Posição vertical"
            valor={ajuste.vertical}
            desabilitado={salvando}
            alterar={(vertical) => ajustar((atual) => ({ ...atual, vertical }))}
          />
          <Card.Footer className="flex-wrap gap-2">
            <Button onPress={salvar} isPending={salvando} isDisabled={!previa}>
              <Icone nome="confirmar" /> Salvar foto
            </Button>
            <Button
              variant="secondary"
              onPress={cancelar}
              isDisabled={salvando}
            >
              Cancelar
            </Button>
          </Card.Footer>
        </>
      )}
      <Typography role="status" className="text-sm">
        {mensagem}
      </Typography>
    </Card>
  );
}
