import { cookies } from "next/headers";
import { commandContext } from "../commands/context";
import { publicError } from "../errors";
import type { ActionResult } from "@/types/action";

export async function actionContext() {
  return commandContext((await cookies()).get("arremata_session")?.value);
}
export async function actionResult<T>(
  operation: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await operation() };
  } catch (error) {
    return { success: false, error: publicError(error).error };
  }
}
