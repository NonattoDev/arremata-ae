import { z } from "zod";
import type { Consultavel } from "../banco/tipos";
import type { LoteBanco } from "../banco/linhas";

const filtrosCatalogo = z.object({
  pagina: z.coerce.number().int().min(1).max(100000).default(1),
  status: z.enum(["live", "scheduled", "closed"]).default("live"),
  ordem: z.enum(["prazo", "menor", "maior", "disputados"]).default("prazo"),
  busca: z.string().max(200).default(""),
  artista: z.string().max(500).default(""),
  data: z.string().max(200).default(""),
  minimo: z.coerce.number().finite().min(0).max(1e12).optional(),
  maximo: z.coerce.number().finite().min(0).max(1e12).optional(),
});
const preco =
  "CASE WHEN current_amount > 0 THEN current_amount ELSE initial END";
const normalizar = (campo: string) =>
  `translate(lower(${campo}), 'áàâãäéèêëíìîïóòôõöúùûüç', 'aaaaaeeeeiiiiooooouuuuc')`;

export async function consultarCatalogo(
  banco: Consultavel,
  entrada: unknown,
  agora: number,
) {
  const filtros = filtrosCatalogo.parse(entrada);
  const valores: unknown[] = [new Date(agora).toISOString()];
  const parametro = (valor: unknown) => {
    valores.push(valor);
    return `$${valores.length}`;
  };
  const condicoes = ["status <> 'cancelled'"];
  if (filtros.busca.trim()) {
    const termo = filtros.busca
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
    condicoes.push(
      `strpos(${normalizar("concat(item->>'title', ' ', item->>'artist')")}, ${parametro(termo)}) > 0`,
    );
  }
  if (filtros.artista)
    condicoes.push(`item->>'artist' = ${parametro(filtros.artista)}`);
  if (filtros.data)
    condicoes.push(`item->>'date' = ${parametro(filtros.data)}`);
  if (filtros.minimo !== undefined)
    condicoes.push(
      `${preco} >= ${parametro(Math.round(filtros.minimo * 100))}`,
    );
  if (filtros.maximo !== undefined)
    condicoes.push(
      `${preco} <= ${parametro(Math.round(filtros.maximo * 100))}`,
    );
  const situacao =
    "CASE WHEN status = 'closed' OR ends_at <= $1::timestamptz THEN 'closed' WHEN starts_at > $1::timestamptz THEN 'scheduled' ELSE 'live' END";
  const base = `FROM lots WHERE ${condicoes.join(" AND ")}`;
  const contagem = await banco.busca<{ status: string; total: number }>(
    `SELECT ${situacao} AS status, COUNT(*)::int AS total ${base} GROUP BY 1`,
    valores,
  );
  const totais: Record<string, number> = { live: 0, scheduled: 0, closed: 0 };
  for (const linha of contagem) totais[linha.status] = linha.total;
  const ordenacao =
    filtros.ordem === "menor"
      ? `${preco} ASC`
      : filtros.ordem === "maior"
        ? `${preco} DESC`
        : filtros.ordem === "disputados"
          ? "bid_count DESC"
          : filtros.status === "scheduled"
            ? "starts_at ASC"
            : filtros.status === "closed"
              ? "ends_at DESC"
              : "ends_at ASC";
  const selecionado = parametro(filtros.status);
  const deslocamento = parametro((filtros.pagina - 1) * 12);
  const lotes = await banco.busca<LoteBanco>(
    `SELECT id, seller_id, item - 'image' AS item, initial, increment, current_amount, bid_count, starts_at, ends_at, status, leader_id, receipt ${base} AND (${situacao}) = ${selecionado} ORDER BY ${ordenacao}, id ASC LIMIT 12 OFFSET ${deslocamento}`,
    valores,
  );
  const [opcoes] = await banco.busca<{
    artistas: string[];
    datas: string[];
    teto: string;
  }>(
    `SELECT array_agg(DISTINCT item->>'artist') AS artistas, array_agg(DISTINCT item->>'date') AS datas, MAX(${preco})::text AS teto FROM lots WHERE status <> 'cancelled'`,
  );
  return {
    lotes,
    totais,
    total: totais[filtros.status],
    pagina: filtros.pagina,
    temMais: filtros.pagina * 12 < totais[filtros.status],
    artistas: (opcoes?.artistas ?? [])
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
    datas: (opcoes?.datas ?? [])
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true })),
    teto: Math.max(100, Number(opcoes?.teto ?? 0)),
  };
}
