"use client";

import { Chip, Label, Radio, RadioGroup } from "@heroui/react";
import { useEffect, useState } from "react";
import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";
import { Icone } from "@/componentes/ui/icone";

export function SeletorPerfil() {
  const [perfil, definirPerfil] = useState("bidder");
  const [referencia, animar] = useAnimate<HTMLDivElement>();
  const reduzirMovimento = useReducedMotion();
  useEffect(() => {
    if (!referencia.current || reduzirMovimento !== false) return;
    const animacao = animar(
      `[data-perfil="${perfil}"]`,
      { scale: [1, 1.15, 1] },
      { duration: 0.3 },
    );
    return () => animacao.stop();
  }, [perfil, animar, referencia, reduzirMovimento]);
  return (
    <RadioGroup
      ref={referencia}
      name="role"
      value={perfil}
      onChange={definirPerfil}
      isRequired
      className="gap-3"
    >
      <Label>Como você quer participar?</Label>
      <Radio
        value="bidder"
        className="w-full max-w-none flex-row items-center gap-3 rounded-xl border border-border p-3"
      >
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label className="flex items-center gap-2">
            <Chip.Label data-perfil="bidder">
              <Icone nome="leilao" />
            </Chip.Label>
            Dar lances
          </Label>
        </Radio.Content>
      </Radio>
      <Radio
        value="seller"
        className="w-full max-w-none flex-row items-center gap-3 rounded-xl border border-border p-3"
      >
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        <Radio.Content>
          <Label className="flex items-center gap-2">
            <Chip.Label data-perfil="seller">
              <Icone nome="imagem" />
            </Chip.Label>
            Publicar lotes
          </Label>
        </Radio.Content>
      </Radio>
    </RadioGroup>
  );
}
