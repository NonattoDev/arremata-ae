import { z } from "zod";

export const preferenciasVazias = {
  whatsapp: false,
  telegram: false,
  email: false,
  numeroWhatsapp: "",
  usuarioTelegram: "",
};
export type PreferenciasNovidades = typeof preferenciasVazias;

export function errosContatosNovidades(dados: PreferenciasNovidades) {
  return {
    numeroWhatsapp:
      dados.whatsapp &&
      !/^\+[1-9]\d{7,14}$/.test(dados.numeroWhatsapp.replace(/[\s().-]/g, ""))
        ? "Informe o número com DDI, como +55 71 99999-9999."
        : "",
    usuarioTelegram:
      dados.telegram &&
      !/^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(dados.usuarioTelegram.trim())
        ? "Use um usuário de 5 a 32 caracteres: letras, números ou _."
        : "",
  };
}

export const esquemaPreferenciasNovidades = z
  .object({
    loteId: z.uuid(),
    whatsapp: z.boolean(),
    telegram: z.boolean(),
    email: z.boolean(),
    numeroWhatsapp: z.string().max(40),
    usuarioTelegram: z.string().max(33),
  })
  .strict()
  .superRefine((dados, contexto) => {
    for (const [campo, mensagem] of Object.entries(
      errosContatosNovidades(dados),
    )) {
      if (mensagem)
        contexto.addIssue({ code: "custom", path: [campo], message: mensagem });
    }
  })
  .transform((dados) => ({
    ...dados,
    numeroWhatsapp: dados.whatsapp
      ? dados.numeroWhatsapp.replace(/[\s().-]/g, "")
      : "",
    usuarioTelegram: dados.telegram
      ? `@${dados.usuarioTelegram.trim().replace(/^@/, "").toLowerCase()}`
      : "",
  }));
