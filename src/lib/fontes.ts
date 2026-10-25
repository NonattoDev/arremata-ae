import { DM_Sans, Instrument_Serif, Bricolage_Grotesque } from "next/font/google";

export const fonteTexto = DM_Sans({
  subsets: ["latin"],
  variable: "--fonte-texto",
  display: "swap",
});

export const fonteTitulo = DM_Sans({
  subsets: ["latin"],
  variable: "--fonte-titulo",
  display: "swap",
});

export const fonteArte = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--fonte-arte",
  display: "swap",
});

export const fonteMarca = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--fonte-marca",
  display: "swap",
});
