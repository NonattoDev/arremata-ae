"use client";
import { Breadcrumbs } from "@heroui/react";
import { usePathname } from "next/navigation";
import { Icone } from "@/componentes/ui/icone";

const titles: Record<string, string> = {
  configuracoes: "Configurações",
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
export function CaminhoPagina() {
  const caminho = usePathname();
  const [area, id] = caminho.split("/").filter(Boolean);
  if (!area || !titles[area]) return null;
  const isLot = ["lotes", "auditoria", "comprovante"].includes(area);
  return (
    <Breadcrumbs
      aria-label="Caminho da página"
      className="mb-5 w-fit max-w-full flex-wrap rounded-full border border-border/60 bg-surface/80 px-4 py-2 text-sm shadow-sm [&_.breadcrumbs__link]:inline-flex [&_.breadcrumbs__link]:items-center [&_.breadcrumbs__link]:gap-1.5 [&_.breadcrumbs__link]:no-underline! [&_.breadcrumbs__link]:transition-colors [&_.breadcrumbs__link:hover]:text-accent"
    >
      <Breadcrumbs.Item href="/" className="gap-1.5">
        <Icone nome="inicio" className="text-base" />
        Início
      </Breadcrumbs.Item>
      {isLot && <Breadcrumbs.Item href="/leiloes">Leilões</Breadcrumbs.Item>}
      {id && isLot && area !== "lotes" && (
        <Breadcrumbs.Item href={`/lotes/${id}`}>Lote</Breadcrumbs.Item>
      )}
      {area === "novo-lote" && (
        <Breadcrumbs.Item href="/meus-lotes">Meus lotes</Breadcrumbs.Item>
      )}
      {area === "carteira" && id === "comprovantes" && <Breadcrumbs.Item href="/carteira">Carteira</Breadcrumbs.Item>}
      <Breadcrumbs.Item className="font-semibold text-foreground">
        {area === "carteira" && id === "comprovantes" ? "Comprovantes" : titles[area]}
      </Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
