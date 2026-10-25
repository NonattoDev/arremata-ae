"use client";
import { Typography } from "@heroui/react";
import { useEffect, useState } from "react";
import { dataLocal } from "@/lib/datas";

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
    <Typography className="whitespace-nowrap tabular-nums">
      {dias ? `${dias}d ` : ""}
      {horas ? `${horas}h ` : ""}
      {minutos}m {String(segundos % 60).padStart(2, "0")}s
    </Typography>
  );
}
