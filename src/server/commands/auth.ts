import type { CommandContext } from "./context";
import { credentialsSchema, registrationSchema } from "./schemas";
import { DomainError } from "../auction";
import {
  hashPassword,
  verifyPassword,
  tokenHash,
  session,
  rateLimit,
} from "../security";

export async function authenticate(
  context: CommandContext,
  mode: "login" | "register",
  input: unknown,
  ip: string,
) {
  const { db, service } = context;
  const parsed = credentialsSchema.parse(input);
  await rateLimit(db, `auth:${tokenHash(ip)}`, 20);
  await rateLimit(db, `email:${tokenHash(parsed.email)}`, 10);
  let id: string;
  if (mode === "register") {
    const data = registrationSchema.parse(input);
    id = await service.createUser(
      data.email,
      data.name,
      await hashPassword(data.password),
      data.role,
    );
  } else {
    const [account] = await db.query(
      "SELECT id,password_hash FROM users WHERE email=$1",
      [parsed.email],
    );
    if (
      !account ||
      !(await verifyPassword(parsed.password, account.password_hash))
    )
      throw new DomainError("E-mail ou senha incorretos.", 401);
    id = account.id;
  }
  return session(db, id);
}

export async function logout(context: CommandContext) {
  if (context.token)
    await context.db.query("DELETE FROM sessions WHERE token_hash=$1", [
      tokenHash(context.token),
    ]);
}

export const sessionCookie = {
  httpOnly: true,
  secure: !!process.env.VERCEL || process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 86400,
};
