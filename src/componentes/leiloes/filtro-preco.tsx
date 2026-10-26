"use client";

import { Card, Label, Slider, Typography } from "@heroui/react";
import { Campo } from "@/componentes/ui/campo";
import { formatarReais } from "@/lib/formatacao";

export function FiltroPreco({
  minimo,
  maximo,
  teto,
  aoAlterar,
}: {
  minimo: string;
  maximo: string;
  teto: number;
  aoAlterar: (minimo: string, maximo: string) => void;
}) {
  const inicio = minimo === "" ? 0 : Math.round(Number(minimo) * 100);
  const fim = maximo === "" ? teto : Math.round(Number(maximo) * 100);
  const invalido = inicio > fim;
  return (
    <Card.Content className="gap-4 p-0">
      <Slider
        aria-label="Faixa de preço"
        minValue={0}
        maxValue={teto}
        step={100}
        value={[
          Math.min(inicio, fim, teto),
          Math.min(Math.max(inicio, fim), teto),
        ]}
        onChange={(valor) => {
          const [menor, maior] = valor as number[];
          aoAlterar(
            String(menor / 100),
            maior === teto ? "" : String(maior / 100),
          );
        }}
      >
        <Label>Faixa de preço</Label>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb index={0} aria-label="Preço mínimo" />
          <Slider.Thumb index={1} aria-label="Preço máximo" />
        </Slider.Track>
      </Slider>
      <Card.Content className="grid grid-cols-2 gap-3 p-0">
        <Campo
          name="preco-minimo"
          label="Mínimo (R$)"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="0"
          value={minimo}
          onChange={(e) => aoAlterar(e.target.value, maximo)}
        />
        <Campo
          name="preco-maximo"
          label="Máximo (R$)"
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="Sem limite"
          value={maximo}
          onChange={(e) => aoAlterar(minimo, e.target.value)}
        />
      </Card.Content>
      <Typography className="text-xs" role={invalido ? "alert" : undefined}>
        {invalido
          ? "O mínimo deve ser menor ou igual ao máximo."
          : `${formatarReais(inicio)} até ${maximo === "" ? "sem limite" : formatarReais(fim)}`}
      </Typography>
      <Card.Description>Lance atual ou valor inicial da obra.</Card.Description>
    </Card.Content>
  );
}
