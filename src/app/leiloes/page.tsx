import type { Metadata } from "next";
import { CatalogoLeiloes } from "@/funcionalidades/leiloes/catalogo";
export const metadata: Metadata = { title: "Leilões | Arremata aê" };
export default function Pagina() {
  return <CatalogoLeiloes />;
}
