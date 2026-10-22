"use server";

import { createLot, placeBid, cancelLot } from "../commands/market";
import { actionContext, actionResult } from "./support";

export async function createLotAction(input: unknown) {
  return actionResult(async () => createLot(await actionContext(), input));
}
export async function placeBidAction(lotId: string, input: unknown) {
  return actionResult(async () =>
    placeBid(await actionContext(), lotId, input),
  );
}
export async function cancelLotAction(lotId: string) {
  return actionResult(async () => cancelLot(await actionContext(), lotId));
}
