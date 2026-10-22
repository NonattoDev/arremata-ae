"use server";

import { cookies, headers } from "next/headers";
import { authenticate, logout, sessionCookie } from "../commands/auth";
import { actionContext, actionResult } from "./support";

async function signIn(mode: "login" | "register", input: unknown) {
  return actionResult(async () => {
    const h = await headers();
    const token = await authenticate(
      await actionContext(),
      mode,
      input,
      h.get("x-vercel-forwarded-for") || h.get("x-forwarded-for") || "local",
    );
    (await cookies()).set("arremata_session", token, sessionCookie);
    return { ok: true };
  });
}
export async function loginAction(input: unknown) {
  return signIn("login", input);
}
export async function registerAction(input: unknown) {
  return signIn("register", input);
}
export async function logoutAction() {
  return actionResult(async () => {
    await logout(await actionContext());
    (await cookies()).delete("arremata_session");
    return { ok: true };
  });
}
