"use client";

import {
  Button,
  FieldError,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { useState } from "react";
import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";

type Propriedades = InputGroup["InputProps"] & {
  rotulo: string;
  icone: NomeIcone;
  name: string;
  ocultarErroComprimento?: boolean;
  erro?: string;
};

export function CampoAcesso({
  rotulo,
  icone,
  required,
  ocultarErroComprimento = false,
  erro,
  ...entrada
}: Propriedades) {
  const [referencia, animar] = useAnimate<HTMLDivElement>();
  const [senhaVisivel, definirSenhaVisivel] = useState(false);
  const campoSenha = entrada.type === "password";
  const reduzirMovimento = useReducedMotion();
  const destacar = () => {
    if (reduzirMovimento !== false || !referencia.current) return;
    animar(referencia.current, { scale: [1, 1.18, 1] }, { duration: 0.3 });
  };
  return (
    <TextField
      name={entrada.name}
      isRequired={required}
      isInvalid={Boolean(erro)}
      fullWidth
    >
      <Label>{rotulo}</Label>
      <InputGroup fullWidth className="min-h-12" onFocus={destacar}>
        <InputGroup.Prefix ref={referencia}>
          <Icone nome={icone} />
        </InputGroup.Prefix>
        <InputGroup.Input
          {...entrada}
          type={campoSenha && senhaVisivel ? "text" : entrada.type}
          required={required}
        />
        {campoSenha && (
          <InputGroup.Suffix>
            <Button
              type="button"
              isIconOnly
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              aria-label={`${senhaVisivel ? "Esconder" : "Mostrar"} ${rotulo.toLowerCase()}`}
              aria-pressed={senhaVisivel}
              isDisabled={entrada.disabled}
              onPress={() => definirSenhaVisivel((visivel) => !visivel)}
            >
              <Icone nome={senhaVisivel ? "ocultar" : "ver"} />
            </Button>
          </InputGroup.Suffix>
        )}
      </InputGroup>
      <FieldError className="text-xs">
        {({ validationDetails, validationErrors }) =>
          erro ||
          (validationDetails.tooShort
            ? ocultarErroComprimento
              ? null
              : `Use pelo menos ${entrada.minLength} caracteres.`
            : validationErrors.join(" "))
        }
      </FieldError>
    </TextField>
  );
}
