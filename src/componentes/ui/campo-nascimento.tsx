"use client";
import dayjs from "dayjs";
import { CampoAcesso } from "@/funcionalidades/autenticacao/campo-acesso";

export function CampoNascimento({
  valor,
  aoAlterar,
  erro,
  desabilitado,
}: {
  valor: string;
  aoAlterar: (valor: string) => void;
  erro?: string;
  desabilitado?: boolean;
}) {
  return (
    <CampoAcesso
      name="nascimento"
      rotulo="Data de nascimento"
      icone="tempo"
      type="date"
      value={valor}
      onChange={(evento) => aoAlterar(evento.target.value)}
      max={dayjs().subtract(1, "day").format("YYYY-MM-DD")}
      erro={erro}
      disabled={desabilitado}
    />
  );
}
