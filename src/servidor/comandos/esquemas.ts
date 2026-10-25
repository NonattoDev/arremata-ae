import { z } from "zod";

export const esquemaDinheiro = z.number().int().positive().max(1_000_000_000);
export const esquemaValor = z.object({ amount: esquemaDinheiro });
export const esquemaCredenciais = z.object({
  email: z
    .email()
    .max(200)
    .transform((valor) => valor.toLowerCase().trim()),
  password: z.string().min(12).max(128),
});
export const esquemaCadastro = esquemaCredenciais.extend({
  name: z.string().trim().min(2).max(80),
  role: z.enum(["seller", "bidder"]),
});
export const esquemaNovoLote = z.object({
  externalId: z.string().regex(/^\d{1,9}$/),
  initial: esquemaDinheiro,
  increment: esquemaDinheiro,
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});
export const esquemaIdLote = z.uuid();
