"use client";
import { Chip, Typography } from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { dataLocal } from "@/lib/datas";
const DigitoAnimado = motion.create(Chip.Label);

function DigitoContador({ valor }: { valor: string }) {
  const reduzirMovimento = useReducedMotion();
  return (
    <Chip.Label
      className="inline-grid overflow-hidden px-0 align-baseline text-center leading-[inherit]"
      aria-hidden="true"
    >
      <Chip.Label className="invisible col-start-1 row-start-1 px-0 leading-[inherit]">
        0
      </Chip.Label>
      <AnimatePresence initial={false}>
        <DigitoAnimado
          key={valor}
          className="col-start-1 row-start-1 px-0 leading-[inherit]"
          initial={
            reduzirMovimento === false ? { opacity: 0, y: "-85%" } : false
          }
          animate={{ opacity: 1, y: 0 }}
          exit={
            reduzirMovimento === false
              ? { opacity: 0, y: "85%" }
              : { opacity: 0 }
          }
          transition={{
            duration: reduzirMovimento ? 0 : 0.45,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {valor}
        </DigitoAnimado>
      </AnimatePresence>
    </Chip.Label>
  );
}

export function ContagemRegressiva({
  end: fim,
  serverTime: horarioServidor,
}: {
  end: string;
  serverTime?: string;
}) {
  const [agora, setNow] = useState<number | null>(null);
  useEffect(() => {
    const diferencaRelogios = horarioServidor
      ? dataLocal(horarioServidor).valueOf() - Date.now()
      : 0;
    const atualizarRelogio = () => setNow(Date.now() + diferencaRelogios);
    atualizarRelogio();
    const temporizador = setInterval(atualizarRelogio, 1000);
    return () => clearInterval(temporizador);
  }, [horarioServidor]);
  if (agora === null) return <Typography>—</Typography>;
  const segundos = Math.max(0, dataLocal(fim).diff(dataLocal(agora), "second"));
  if (segundos === 0) return <Typography>Encerrando</Typography>;
  const dias = Math.floor(segundos / 86400),
    horas = Math.floor(segundos / 3600) % 24,
    minutos = Math.floor(segundos / 60) % 60;
  return (
    <Typography
      className={`whitespace-nowrap tabular-nums font-medium ${segundos <= 120 ? "text-orange-700 dark:text-orange-300" : "text-blue-800 dark:text-blue-200"}`}
    >
      {dias ? `${dias}d ` : ""}
      {horas ? `${horas}h ` : ""}
      {minutos}m{" "}
      <Chip.Label
        className="px-0 leading-[inherit]"
        aria-label={`${segundos % 60} segundos`}
      >
        {String(segundos % 60)
          .padStart(2, "0")
          .split("")
          .map((digito, posicao) => (
            <DigitoContador key={posicao} valor={digito} />
          ))}
        <Chip.Label aria-hidden="true" className="px-0">
          s
        </Chip.Label>
      </Chip.Label>
    </Typography>
  );
}
