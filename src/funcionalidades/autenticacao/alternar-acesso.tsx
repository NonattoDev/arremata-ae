"use client";

import { useEffect } from "react";
import { Card, Link, buttonVariants } from "@heroui/react";
import { useAnimate } from "motion/react-mini";
import { useReducedMotion } from "motion/react";
import { Icone } from "@/componentes/ui/icone";

export function AlternarAcesso({ cadastro }: { cadastro: boolean }) {
  const [referencia, animar] = useAnimate<HTMLAnchorElement>();
  const reduzirMovimento = useReducedMotion();
  useEffect(() => {
    if (!referencia.current) return;
    if (cadastro || reduzirMovimento !== false) {
      animar(referencia.current, { transform: "translateX(0px)" }, { duration: 0 });
      return;
    }
    let animacao: ReturnType<typeof animar> | undefined;
    const vibrar = () => {
      if (!referencia.current) return;
      animacao?.stop();
      animacao = animar(
        referencia.current,
        { transform: ["translateX(0px)", "translateX(-4px)", "translateX(4px)", "translateX(-3px)", "translateX(3px)", "translateX(0px)"] },
        { duration: 0.55, ease: "easeInOut" },
      );
    };
    vibrar();
    const repeticao = window.setInterval(vibrar, 1800);
    return () => {
      window.clearInterval(repeticao);
      animacao?.stop();
    };

  }, [animar, cadastro, reduzirMovimento, referencia]);
  return (
    <Card.Footer className="w-full flex-col items-center gap-3 border-t border-border pt-6 text-center">
      <Card.Description>
        {cadastro ? "Já possui uma conta?" : "Ainda não tem uma conta?"}
      </Card.Description>
      <Link
        ref={referencia}
        href={cadastro ? "/entrar" : "/cadastro"}
        className={buttonVariants({
          variant: "secondary",
          size: "lg",
          className: "w-full max-w-xs",
        })}
      >
        <Icone nome={cadastro ? "entrar" : "cadastro"} />
        {cadastro ? "Fazer login" : "Criar conta"}
      </Link>
    </Card.Footer>
  );
}
