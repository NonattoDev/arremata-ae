type ContagemLances = { id: string; bidCount: number };

export function selecionarLancesAudiveis<T extends ContagemLances>(
  lotes: T[],
  acompanhados: string[],
  silenciados: string[],
): T[] {
  return lotes.filter(
    (lote) => acompanhados.includes(lote.id) && !silenciados.includes(lote.id),
  );
}

export function detectarNovosLances(
  anteriores: Map<string, number>,
  atuais: ContagemLances[],
) {
  return atuais.some((lote) => {
    const quantidadeAnterior = anteriores.get(lote.id);
    return (
      quantidadeAnterior !== undefined && lote.bidCount > quantidadeAnterior
    );
  });
}
