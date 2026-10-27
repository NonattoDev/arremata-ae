import { z } from "zod";
import { esquemaConfirmacaoSenha } from "@/lib/confirmacao-senha";
import { exigirUsuario, type ContextoComando } from "./contexto";
import {
  gerarHashSenha,
  verificarSenha,
  hashToken,
  limitarTentativas,
} from "../seguranca";
import { ErroDominio } from "../leilao";

const esquemaTroca = esquemaConfirmacaoSenha.and(
  z.object({ senhaAtual: z.string().min(1).max(128) }),
);
export async function alterarSenha(
  contexto: ContextoComando,
  entrada: unknown,
) {
  const usuario = await exigirUsuario(contexto);
  await limitarTentativas(contexto.db, `senha:${usuario.id}`, 5);
  const dados = esquemaTroca.parse(entrada);
  const [conta] = await contexto.db.busca<{ password_hash: string }>(
    "SELECT password_hash FROM users WHERE id=$1",
    [usuario.id],
  );
  if (!conta || !(await verificarSenha(dados.senhaAtual, conta.password_hash)))
    throw new ErroDominio("A senha atual está incorreta.");
  if (dados.password === dados.senhaAtual)
    throw new ErroDominio("Escolha uma senha diferente da atual.");
  const novoHash = await gerarHashSenha(dados.password);
  await contexto.db.transacionar(async (banco) => {
    // A comparação impede duas trocas simultâneas usando a mesma senha antiga.
    const alterados = await banco.busca(
      "UPDATE users SET password_hash=$1 WHERE id=$2 AND password_hash=$3 RETURNING id",
      [novoHash, usuario.id, conta.password_hash],
    );
    if (!alterados.length)
      throw new ErroDominio("A senha já foi alterada. Entre novamente.");
    await banco.busca(
      "DELETE FROM sessions WHERE user_id=$1 AND token_hash<>$2",
      [usuario.id, hashToken(contexto.token || "")],
    );
  });
  return { ok: true };
}
