"use client";
import { useEffect, useState } from "react";
import { Card, Link, Typography } from "@heroui/react";
import { confirmarQrAcao } from "@/servidor/actions/depositos";
import { executarAcao } from "@/lib/executar-acao";
import { formatarReais } from "@/lib/formatacao";
import { Icone } from "@/componentes/ui/icone";
export function ConfirmacaoPix({ id }: { id: string }) {
  const [mensagem, definirMensagem] = useState("Confirmando simulação…");
  useEffect(() => {
    let ativo = true;
    executarAcao(() => confirmarQrAcao(id))
      .then((resultado) => {
        if (ativo)
          definirMensagem(
            resultado.estado === "confirmed"
              ? `${formatarReais(resultado.valor)} adicionados à carteira. Nenhuma cobrança real foi feita.`
              : "Este depósito foi cancelado ou expirou.",
          );
      })
      .catch((erro) => {
        if (ativo) definirMensagem(erro.message);
      });
    return () => {
      ativo = false;
    };
  }, [id]);
  return (
    <Card className="mx-auto max-w-md gap-5 p-6">
      <Icone nome="qr" className="text-accent" />
      <Card.Title>Pix simulado</Card.Title>
      <Typography role="status">{mensagem}</Typography>
      <Link href="/carteira">Voltar à carteira</Link>
    </Card>
  );
}
