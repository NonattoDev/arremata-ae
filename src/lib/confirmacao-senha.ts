import { z } from "zod";

export const esquemaConfirmacaoSenha = z
  .object({
    password: z.string().min(12).max(128),
    confirmacaoSenha: z.string(),
  })
  .refine((dados) => dados.password === dados.confirmacaoSenha, {
    message: "A confirmação deve ser igual à senha.",
    path: ["confirmacaoSenha"],
  });
