import { database } from "../database";
import { AuctionService, DomainError } from "../auction";
import { tokenHash, rateLimit } from "../security";
import type { User } from "@/types/auction";

export async function commandContext(token?: string) {
  const db = await database();
  const [user] = token
    ? await db.query<User>(
        "SELECT u.id,u.name,u.email,u.role,u.alias FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at > now()",
        [tokenHash(token)],
      )
    : [];
  return {
    db,
    service: new AuctionService(db, process.env.AUDIT_SECRET || ""),
    user: user as User | undefined,
    token,
  };
}
export type CommandContext = Awaited<ReturnType<typeof commandContext>>;

export async function requireWriter(context: CommandContext) {
  if (!context.user)
    throw new DomainError("Entre na sua conta para continuar.", 401);
  await rateLimit(context.db, `write:${context.user.id}`, 60);
  return context.user;
}
