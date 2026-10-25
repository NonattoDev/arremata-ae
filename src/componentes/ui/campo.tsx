"use client";
import { Input, Label, TextField, FieldError } from "@heroui/react";
import type { ComponentProps } from "react";
type PropriedadesCampo = Omit<ComponentProps<typeof Input>, "children"> & {
  label: string;
  name: string;
};
export function Campo({
  label: rotulo,
  name: nome,
  required: obrigatorio,
  disabled: desabilitado,
  value: valor,
  defaultValue,
  ...input
}: PropriedadesCampo) {
  return (
    <TextField
      name={nome}
      isRequired={obrigatorio}
      isDisabled={desabilitado}
      value={valor === undefined ? undefined : String(valor)}
      defaultValue={
        defaultValue === undefined ? undefined : String(defaultValue)
      }
      fullWidth
    >
      <Label>{rotulo}</Label>
      <Input
        {...input}
        name={nome}
        required={obrigatorio}
        disabled={desabilitado}
        fullWidth
      />
      <FieldError />
    </TextField>
  );
}
