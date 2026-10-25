import { ErroDominio } from "../leilao";
import { importarObra } from "../catalogo";
import { exigirUsuario, type ContextoComando } from "./contexto";
import { esquemaValor, esquemaNovoLote, esquemaIdLote } from "./esquemas";

export async function depositar(contexto: ContextoComando, entrada: unknown) {
  const usuario = await exigirUsuario(contexto);
  return contexto.service.depositar(
    usuario.id,
    esquemaValor.parse(entrada).amount,
  );
}
export async function criarLote(contexto: ContextoComando, entrada: unknown) {
  const usuario = await exigirUsuario(contexto);
  if (usuario.role !== "seller")
    throw new ErroDominio("Apenas leiloeiros podem criar lotes.", 403);
  const dados = esquemaNovoLote.parse(entrada);
  return {
    id: await contexto.service.criarLote(usuario.id, {
      ...dados,
      item: await importarObra(dados.externalId),
    }),
  };
}
export async function darLance(
  contexto: ContextoComando,
  idLote: unknown,
  entrada: unknown,
) {
  const usuario = await exigirUsuario(contexto);
  return contexto.service.darLance(
    usuario.id,
    esquemaIdLote.parse(idLote),
    esquemaValor.parse(entrada).amount,
  );
}
export async function cancelarLote(contexto: ContextoComando, idLote: unknown) {
  const usuario = await exigirUsuario(contexto);
  await contexto.service.cancelar(usuario.id, esquemaIdLote.parse(idLote));
  return { ok: true };
}
