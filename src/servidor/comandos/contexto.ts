import { bancoDados } from "../banco";
import { ServicoLeiloes, ErroDominio } from "../leilao";
import { hashToken, limitarTentativas } from "../seguranca";
import type { Usuario } from "@/tipos/leilao";

export async function contextoComando(token?: string) {
  const banco = await bancoDados();
  const [usuario] = token
    ? await banco.busca<Usuario>(
        "SELECT u.id,u.name,u.email,u.role,u.alias,u.avatar,u.cpf FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at > now()",
        [hashToken(token)],
      )
    : [];
  return {
    db: banco,
    service: new ServicoLeiloes(banco, process.env.AUDIT_SECRET || ""),
    user: usuario as Usuario | undefined,
    token,
  };
}
export type ContextoComando = Awaited<ReturnType<typeof contextoComando>>;

export async function exigirUsuario(contexto: ContextoComando) {
  if (!contexto.user)
    throw new ErroDominio("Entre na sua conta para continuar.", 401);
  await limitarTentativas(contexto.db, `write:${contexto.user.id}`, 60);
  return contexto.user;
}
