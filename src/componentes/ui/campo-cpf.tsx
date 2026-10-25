"use client";
import { useEffect } from "react";
import { Card } from "@heroui/react";
import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";
import { CampoAcesso } from "@/funcionalidades/autenticacao/campo-acesso";
import { formatarCpf } from "@/lib/cpf";
type Propriedades = {
  erro?: string;
  tentativa?: number;
  valor: string;
  aoAlterar: (valor: string) => void;
  desabilitado?: boolean;
  className?: string;
};
export function CampoCpf({
  erro,
  tentativa = 0,
  valor,
  aoAlterar,
  desabilitado,
  className,
}: Propriedades) {
  const [referencia, animar] = useAnimate<HTMLDivElement>();
  const reduzirMovimento = useReducedMotion();
  useEffect(() => {
    if (!tentativa || reduzirMovimento !== false || !referencia.current) return;
    const animacao = animar(
      referencia.current,
      { x: [0, -6, 6, -4, 4, 0] },
      { duration: 0.38 },
    );
    return () => animacao.stop();
  }, [tentativa, reduzirMovimento, animar, referencia]);
  return (
    <Card.Content ref={referencia} className="w-full min-w-0">
      <CampoAcesso
        erro={erro}
        name="cpf"
        rotulo="CPF"
        icone="pessoa"
        value={valor}
        onChange={(evento) => aoAlterar(formatarCpf(evento.target.value))}
        placeholder="000.000.000-00"
        inputMode="numeric"
        maxLength={14}
        disabled={desabilitado}
        className={className}
      />
    </Card.Content>
  );
}
