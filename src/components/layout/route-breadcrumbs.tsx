"use client";
import { Breadcrumbs } from "@heroui/react";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  leiloes: "Leilões",
  entrar: "Entrar",
  cadastro: "Criar conta",
  "meus-lotes": "Meus lotes",
  carteira: "Carteira",
  "novo-lote": "Criar lote",
  lotes: "Lote",
  auditoria: "Auditoria",
  comprovante: "Comprovante",
};
export function RouteBreadcrumbs() {
  const path = usePathname();
  const [area, id] = path.split("/").filter(Boolean);
  if (!area || !titles[area]) return null;
  const isLot = ["lotes", "auditoria", "comprovante"].includes(area);
  return (
    <Breadcrumbs aria-label="Caminho da página" className="mb-4">
      <Breadcrumbs.Item href="/">Início</Breadcrumbs.Item>
      {isLot && <Breadcrumbs.Item href="/leiloes">Leilões</Breadcrumbs.Item>}
      {id && area !== "lotes" && (
        <Breadcrumbs.Item href={`/lotes/${id}`}>Lote</Breadcrumbs.Item>
      )}
      {area === "novo-lote" && (
        <Breadcrumbs.Item href="/meus-lotes">Meus lotes</Breadcrumbs.Item>
      )}
      <Breadcrumbs.Item>{titles[area]}</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
