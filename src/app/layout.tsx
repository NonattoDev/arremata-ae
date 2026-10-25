import { ProvedorAcompanhamento } from "@/componentes/provedores/provedor-acompanhamento";
import { EstruturaAplicacao } from "@/componentes/layout/estrutura-aplicacao";
import { ProvedorSessao } from "@/componentes/provedores/provedor-sessao";
import type { Metadata } from "next";
import { fonteTexto, fonteTitulo, fonteMarca, fonteArte } from "@/lib/fontes";
import "./globals.css";
export const metadata: Metadata = {
  icons: {
    icon: "/brand/arremata-symbol.png",
    apple: "/brand/arremata-symbol.png",
  },
  title: "Arremata aê | Leilões de arte",
  description:
    "Leilões de arte com consulta de lotes, lances ao vivo e histórico de arremates.",
};
export default function LayoutRaiz({
  children: filhos,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body
        className={`${fonteTexto.className} ${fonteTexto.variable} ${fonteTitulo.variable} ${fonteMarca.variable} ${fonteArte.variable} antialiased [&_.link]:gap-2 [&_h1]:font-[family-name:var(--fonte-titulo)] [&_h2]:font-[family-name:var(--fonte-titulo)] [&_h3]:font-[family-name:var(--fonte-titulo)] [&_.card__title]:font-[family-name:var(--fonte-titulo)]`}
      >
        <ProvedorSessao>
          <ProvedorAcompanhamento>
            <EstruturaAplicacao>{filhos}</EstruturaAplicacao>
          </ProvedorAcompanhamento>
        </ProvedorSessao>
      </body>
    </html>
  );
}
