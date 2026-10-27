"use client";

import { Card, Label, Slider, Typography } from "@heroui/react";
import { CampoMoeda } from "@/componentes/ui/campo-moeda";
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
        <CampoMoeda
          name="preco-minimo"
          label="Mínimo (R$)"
          required={false}
          valor={inicio}
          exibirZero={minimo !== ""}
          alterar={(valor) => aoAlterar(String(valor / 100), maximo)}
          aoLimpar={() => aoAlterar("", maximo)}
        />
        <CampoMoeda
          name="preco-maximo"
          label="Máximo (R$)"
          required={false}
          placeholder="Sem limite"
          valor={maximo === "" ? 0 : fim}
          exibirZero={maximo !== ""}
          alterar={(valor) => aoAlterar(minimo, String(valor / 100))}
          aoLimpar={() => aoAlterar(minimo, "")}
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
