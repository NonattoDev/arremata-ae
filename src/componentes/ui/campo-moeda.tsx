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
  name = "valor",
  label = "Valor (R$)",
  placeholder = "0,00",
  required = true,
  aoLimpar,
  exibirZero = false,
}: {
  valor: number;
  alterar: (valor: number) => void;
  disabled?: boolean;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  aoLimpar?: () => void;
  exibirZero?: boolean;
}) {
  return (
    <Campo
      name={name}
      label={label}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      disabled={disabled}
      value={valor || exibirZero ? formatarValorCampo(valor) : ""}
      placeholder={placeholder}
      required={required}
      onChange={(evento) => {
        if (!evento.target.value && aoLimpar) return aoLimpar();
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
