export const LIMITE_DEPOSITO = 1_000_000_000;

// A máscara trabalha em centavos: não há multiplicação de decimais no envio.
export function centavosDigitados(texto: string): number | null {
  if (!/^[\d\s.,R$]*$/.test(texto)) return null;
  const digitos = texto.replace(/\D/g, "");
  if (!digitos) return 0;
  const valor = Number(digitos);
  return Number.isSafeInteger(valor) && valor <= LIMITE_DEPOSITO ? valor : null;
}

export function centavosColados(texto: string): number | null {
  const limpo = texto.trim().replace(/^R\$\s*/, "");
  if (!/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(limpo)) return null;
  const [inteiros, decimais = ""] = limpo.split(",");
  return centavosDigitados(
    inteiros.replace(/\./g, "") + decimais.padEnd(2, "0"),
  );
}

export function formatarValorCampo(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
