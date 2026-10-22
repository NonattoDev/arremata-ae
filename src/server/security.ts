import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { Database } from "./database";
import { DomainError } from "./auction";
const scrypt = promisify(scryptCallback);
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const result = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${result.toString("hex")}`;
}
export async function verifyPassword(password: string, hash: string) {
  const [salt, hex] = hash.split(":");
  if (!salt || !hex || hex.length !== 128) return false;
  const result = (await scrypt(password, salt, 64)) as Buffer;
  return timingSafeEqual(result, Buffer.from(hex, "hex"));
}
export const tokenHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function session(db: Database, userId: string) {
  const token = randomBytes(32).toString("hex");
  await db.query(
    "INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,$3)",
    [tokenHash(token), userId, new Date(Date.now() + 7 * 86400000)],
  );
  return token;
}
export async function rateLimit(db: Database, key: string, maximum: number) {
  const [row] = await db.query(
    `INSERT INTO rate_limits (key,hits,resets_at) VALUES ($1,1,now()+interval '1 minute')
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.resets_at < now() THEN 1 ELSE rate_limits.hits+1 END,
    resets_at=CASE WHEN rate_limits.resets_at < now() THEN now()+interval '1 minute' ELSE rate_limits.resets_at END RETURNING hits`,
    [key],
  );
  if (row.hits > maximum)
    throw new DomainError("Muitas tentativas. Aguarde um minuto.", 429);
}
