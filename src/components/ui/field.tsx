"use client";
import { Input, Label, TextField, FieldError } from "@heroui/react";
import type { ComponentProps } from "react";
type FieldProps = Omit<ComponentProps<typeof Input>, "children"> & {
  label: string;
  name: string;
};
export function Field({
  label,
  name,
  required,
  disabled,
  value,
  defaultValue,
  ...input
}: FieldProps) {
  return (
    <TextField
      name={name}
      isRequired={required}
      isDisabled={disabled}
      value={value === undefined ? undefined : String(value)}
      defaultValue={
        defaultValue === undefined ? undefined : String(defaultValue)
      }
      fullWidth
    >
      <Label>{label}</Label>
      <Input
        {...input}
        name={name}
        required={required}
        disabled={disabled}
        fullWidth
      />
      <FieldError />
    </TextField>
  );
}
