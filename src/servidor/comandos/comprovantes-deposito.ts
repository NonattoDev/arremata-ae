import { z } from "zod";
import { exigirUsuario, type ContextoComando } from "./contexto";

export async function listarComprovantesDeposito(
  contexto: ContextoComando,
  paginaEntrada: unknown = 1,
) {
  const usuario = await exigirUsuario(contexto);
  const pagina = z.number().int().min(1).max(100000).parse(paginaEntrada);
  const linhas = await contexto.db.busca(
    "SELECT id, amount, method, confirmed_at FROM deposit_simulations WHERE user_id=$1 AND status='confirmed' ORDER BY confirmed_at DESC, id DESC LIMIT 11 OFFSET $2",
    [usuario.id, (pagina - 1) * 10],
  );
  return {
    pagina,
    temMais: linhas.length > 10,
    comprovantes: linhas.slice(0, 10).map((linha) => ({
      id: String(linha.id),
      valor: Number(linha.amount),
      metodo: String(linha.method),
      confirmadoEm: new Date(linha.confirmed_at).toISOString(),
    })),
  };
}
