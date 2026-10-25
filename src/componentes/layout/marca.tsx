"use client";

import Image from "next/image";
import { Link, Typography } from "@heroui/react";
import { useAnimacaoMarca } from "@/hooks/use-animacao-marca";

export function Marca({ vertical = false }: { vertical?: boolean }) {
  const { simbolo, destacar } = useAnimacaoMarca();
  return (
    <Link
      href="/"
      aria-label="Arremata aê, início"
      onHoverStart={() => {
        destacar();
      }}
      onFocus={() => {
        destacar();
      }}
      className={`flex w-fit shrink-0 items-center gap-2 sm:gap-3 ${vertical ? "flex-col text-center" : ""}`}
    >
      <Image
        ref={simbolo}
        src="/brand/arremata-symbol.png"
        alt=""
        width={vertical ? 128 : 56}
        height={vertical ? 128 : 56}
        sizes={vertical ? "(min-width: 640px) 128px, 104px" : "56px"}
        className={`shrink-0 object-contain ${vertical ? "h-26 w-26 sm:h-32 sm:w-32" : "h-10 w-10 sm:h-12 sm:w-12"}`}
      />
      <Typography className="font-[family-name:var(--fonte-texto)] text-xl font-semibold tracking-tight sm:text-2xl">
        Arremata aê
      </Typography>
    </Link>
  );
}
