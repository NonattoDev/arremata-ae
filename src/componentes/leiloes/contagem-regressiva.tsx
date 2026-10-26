"use client";
import { Chip, Typography } from "@heroui/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { dataLocal } from "@/lib/datas";
const SegundosAnimados = motion.create(Chip.Label);

export function ContagemRegressiva({
  end: fim,
  serverTime: horarioServidor,
}: {
  end: string;
  serverTime?: string;
}) {
  const [agora, setNow] = useState<number | null>(null);
  const reduzirMovimento = useReducedMotion();
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
      <SegundosAnimados
        key={segundos}
        className="inline-block min-w-[3ch] rounded-md bg-blue-100/60 px-1 text-center dark:bg-blue-900/40"
        initial={reduzirMovimento === false ? { opacity: 0.55, y: -2 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {String(segundos % 60).padStart(2, "0")}s
      </SegundosAnimados>
    </Typography>
  );
}
