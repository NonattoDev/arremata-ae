import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import type { BancoDados } from "./banco";
import { ErroDominio } from "./leilao";
const scrypt = promisify(scryptCallback);
export async function gerarHashSenha(senha: string) {
  const sal = randomBytes(16).toString("hex");
  const resultado = (await scrypt(senha, sal, 64)) as Buffer;
  return `${sal}:${resultado.toString("hex")}`;
}
export async function verificarSenha(senha: string, hash: string) {
  const [sal, hexadecimal] = hash.split(":");
  if (!sal || !hexadecimal || hexadecimal.length !== 128) return false;
  const resultado = (await scrypt(senha, sal, 64)) as Buffer;
  return timingSafeEqual(resultado, Buffer.from(hexadecimal, "hex"));
}
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function sessao(banco: BancoDados, idUsuario: string) {
  const token = randomBytes(32).toString("hex");
  await banco.busca(
    "INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,$3)",
    [hashToken(token), idUsuario, new Date(Date.now() + 7 * 86400000)],
  );
  return token;
}
export async function limitarTentativas(
  banco: BancoDados,
  chave: string,
  maximo: number,
) {
  const [linha] = await banco.busca(
    `INSERT INTO rate_limits (key,hits,resets_at) VALUES ($1,1,now()+interval '1 minute')
    ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN rate_limits.resets_at < now() THEN 1 ELSE rate_limits.hits+1 END,
    resets_at=CASE WHEN rate_limits.resets_at < now() THEN now()+interval '1 minute' ELSE rate_limits.resets_at END RETURNING hits`,
    [chave],
  );
  if (linha.hits > maximo)
    throw new ErroDominio("Muitas tentativas. Aguarde um minuto.", 429);
}
