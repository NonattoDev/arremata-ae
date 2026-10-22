"use server";

import { deposit } from "../commands/market";
import { actionContext, actionResult } from "./support";

export async function depositAction(input: unknown) {
  return actionResult(async () => deposit(await actionContext(), input));
}
