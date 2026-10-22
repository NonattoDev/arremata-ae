import { z } from "zod";

export const moneySchema = z.number().int().positive().max(1_000_000_000);
export const amountSchema = z.object({ amount: moneySchema });
export const credentialsSchema = z.object({
  email: z
    .email()
    .max(200)
    .transform((value) => value.toLowerCase().trim()),
  password: z.string().min(12).max(128),
});
export const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
  role: z.enum(["seller", "bidder"]),
});
export const createLotSchema = z.object({
  externalId: z.string().regex(/^\d{1,9}$/),
  initial: moneySchema,
  increment: moneySchema,
  startsAt: z.iso.datetime(),
  endsAt: z.iso.datetime(),
});
export const lotIdSchema = z.uuid();
