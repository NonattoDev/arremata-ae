import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Arremata aê — Histórias que merecem um lance",
  description:
    "Explore obras de arte, acompanhe leilões ao vivo e encontre sua próxima história. Projeto demonstrativo com saldo simulado.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
