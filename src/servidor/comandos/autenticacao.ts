import type { ContextoComando } from "./contexto";
import { esquemaCredenciais, esquemaCadastro } from "./esquemas";
import { ErroDominio } from "../leilao";
import {
  gerarHashSenha,
  verificarSenha,
  hashToken,
  sessao,
  limitarTentativas,
} from "../seguranca";

export async function autenticar(
  contexto: ContextoComando,
  modo: "login" | "register",
  entrada: unknown,
  ip: string,
) {
  const { db: banco, service: servico } = contexto;
  const validado = esquemaCredenciais.parse(entrada);
  await limitarTentativas(banco, `auth:${hashToken(ip)}`, 20);
  await limitarTentativas(banco, `email:${hashToken(validado.email)}`, 10);
  let id: string;
  if (modo === "register") {
    const dados = esquemaCadastro.parse(entrada);
    id = await servico.criarUsuario(
      dados.email,
      dados.name,
      await gerarHashSenha(dados.password),
      dados.role,
    );
  } else {
    const [conta] = await banco.busca<{ id: string; password_hash: string }>(
      "SELECT id,password_hash FROM users WHERE email=$1",
      [validado.email],
    );
    if (
      !conta ||
      !(await verificarSenha(validado.password, conta.password_hash))
    )
      throw new ErroDominio("E-mail ou senha incorretos.", 401);
    id = conta.id;
  }
  return sessao(banco, id);
}

export async function sair(contexto: ContextoComando) {
  if (contexto.token)
    await contexto.db.busca("DELETE FROM sessions WHERE token_hash=$1", [
      hashToken(contexto.token),
    ]);
}

export const cookieSessao = {
  httpOnly: true,
  secure: !!process.env.VERCEL || process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 7 * 86400,
};
