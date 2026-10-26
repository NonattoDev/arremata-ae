"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Button, Card, Link, Typography } from "@heroui/react";
import { Icone } from "@/componentes/ui/icone";
export function PainelPix({ id, segundos }: { id: string; segundos: number }) {
  const [imagem, definirImagem] = useState("");
  const [endereco, definirEndereco] = useState("");
  const [copiado, definirCopiado] = useState(false);
  useEffect(() => {
    let ativo = true;
    const url = `${window.location.origin}/simulacao/pix/${id}`;
    definirEndereco(url);
    QRCode.toDataURL(url, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: "M",
    }).then((valor) => {
      if (ativo) definirImagem(valor);
    });
    return () => {
      ativo = false;
    };
  }, [id]);
  return (
    <Card.Content className="items-center gap-4 text-center">
      {imagem && (
        <Image
          src={imagem}
          width={224}
          height={224}
          alt="QR Code para confirmar o depósito simulado"
          unoptimized
          className="max-w-full rounded-xl"
        />
      )}
      <Typography className="text-lg font-semibold tabular-nums" role="status">
        {segundos > 0
          ? `Confirmação automática em ${segundos}s`
          : "Confirmando depósito…"}
      </Typography>
      <Card.Description>
        Leia o QR com a câmera para confirmar agora ou aguarde a contagem. Não
        use um aplicativo bancário.
      </Card.Description>
      <Card.Content className="flex-row flex-wrap justify-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onPress={async () => {
            try {
              await navigator.clipboard.writeText(endereco);
              definirCopiado(true);
            } catch {
              definirCopiado(false);
            }
          }}
        >
          <Icone nome="copiar" />
          {copiado ? "Link copiado" : "Copiar link"}
        </Button>
        <Link
          href={endereco || undefined}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir simulação
          <Icone nome="externo" />
        </Link>
      </Card.Content>
    </Card.Content>
  );
}
