import { Label, Slider } from "@heroui/react";

export function ControleCorte({
  rotulo,
  valor,
  minimo = -100,
  maximo = 100,
  passo = 1,
  alterar,
  desabilitado = false,
}: {
  rotulo: string;
  valor: number;
  minimo?: number;
  maximo?: number;
  passo?: number;
  alterar: (valor: number) => void;
  desabilitado?: boolean;
}) {
  return (
    <Slider
      aria-label={rotulo}
      minValue={minimo}
      maxValue={maximo}
      step={passo}
      value={valor}
      onChange={(valor) => alterar(Number(valor))}
      isDisabled={desabilitado}
    >
      <Label>{rotulo}</Label>
      <Slider.Track>
        <Slider.Fill />
        <Slider.Thumb />
      </Slider.Track>
    </Slider>
  );
}
