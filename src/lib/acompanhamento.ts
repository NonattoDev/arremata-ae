export const LIMITE_ACOMPANHAMENTO = 5;
const identificadorValido = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function lerAcompanhamento(conteudo: string | null): string[] {
  try {
    const dados: unknown = JSON.parse(conteudo || "[]");
    if (!Array.isArray(dados)) return [];
    return [
      ...new Set(
        dados.filter(
          (id): id is string =>
            typeof id === "string" && identificadorValido.test(id),
        ),
      ),
    ].slice(0, LIMITE_ACOMPANHAMENTO);
  } catch {
    return [];
  }
}

export function adicionarAcompanhamento(
  atuais: string[],
  id: string,
): string[] {
  if (atuais.includes(id)) return atuais;
  if (atuais.length >= LIMITE_ACOMPANHAMENTO)
    throw new Error(
      "Você já acompanha 5 leilões. Remova um para adicionar outro.",
    );
  if (!identificadorValido.test(id)) throw new Error("Lote inválido.");
  return [...atuais, id];
}
