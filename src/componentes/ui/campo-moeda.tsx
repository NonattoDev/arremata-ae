"use client";
import { Campo } from "./campo";
import {
  centavosDigitados,
  centavosColados,
  formatarValorCampo,
} from "@/lib/valor-monetario";

export function CampoMoeda({
  valor,
  alterar,
  disabled = false,
}: {
  valor: number;
  alterar: (valor: number) => void;
  disabled?: boolean;
}) {
  return (
    <Campo
      name="valor"
      label="Valor (R$)"
      type="text"
      inputMode="numeric"
      autoComplete="off"
      disabled={disabled}
      value={valor ? formatarValorCampo(valor) : ""}
      placeholder="0,00"
      required
      onChange={(evento) => {
        const novo = centavosDigitados(evento.target.value);
        if (novo !== null) alterar(novo);
      }}
      onPaste={(evento) => {
        evento.preventDefault();
        const novo = centavosColados(evento.clipboardData.getData("text"));
        if (novo !== null) alterar(novo);
      }}
    />
  );
}
