import { DomainError } from "../auction";
import { importArt } from "../catalog";
import { requireWriter, type CommandContext } from "./context";
import { amountSchema, createLotSchema, lotIdSchema } from "./schemas";

export async function deposit(context: CommandContext, input: unknown) {
  const user = await requireWriter(context);
  return context.service.deposit(user.id, amountSchema.parse(input).amount);
}
export async function createLot(context: CommandContext, input: unknown) {
  const user = await requireWriter(context);
  if (user.role !== "seller")
    throw new DomainError("Apenas leiloeiros podem criar lotes.", 403);
  const data = createLotSchema.parse(input);
  return {
    id: await context.service.createLot(user.id, {
      ...data,
      item: await importArt(data.externalId),
    }),
  };
}
export async function placeBid(
  context: CommandContext,
  lotId: unknown,
  input: unknown,
) {
  const user = await requireWriter(context);
  return context.service.bid(
    user.id,
    lotIdSchema.parse(lotId),
    amountSchema.parse(input).amount,
  );
}
export async function cancelLot(context: CommandContext, lotId: unknown) {
  const user = await requireWriter(context);
  await context.service.cancel(user.id, lotIdSchema.parse(lotId));
  return { ok: true };
}
