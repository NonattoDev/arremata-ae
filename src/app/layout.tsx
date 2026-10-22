import { AppShell } from "@/components/layout/app-shell";
import { SessionProvider } from "@/components/providers/session-provider";
import type { Metadata } from "next";
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
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body>
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
