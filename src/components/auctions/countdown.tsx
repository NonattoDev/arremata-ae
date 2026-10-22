"use client";
import { useEffect, useState } from "react";

export function Countdown({
  end,
  serverTime,
}: {
  end: string;
  serverTime?: string;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const offset = serverTime ? new Date(serverTime).getTime() - Date.now() : 0;
    const tick = () => setNow(Date.now() + offset);
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [serverTime]);
  if (now === null) return <span>—</span>;
  const seconds = Math.max(
    0,
    Math.floor((new Date(end).getTime() - now) / 1000),
  );
  if (seconds === 0) return <span>Encerrando</span>;
  const days = Math.floor(seconds / 86400),
    hours = Math.floor(seconds / 3600) % 24,
    minutes = Math.floor(seconds / 60) % 60;
  return (
    <span>
      {days ? `${days}d ` : ""}
      {hours ? `${hours}h ` : ""}
      {minutes}m {!days && !hours ? `${seconds % 60}s` : ""}
    </span>
  );
}
