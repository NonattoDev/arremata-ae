export async function consultarApi<T>(endereco: string): Promise<T> {
  const resposta = await fetch(`/api/${endereco}`, { cache: "no-store" });
  const dados: unknown = await resposta.json().catch(() => null);
  if (!resposta.ok)
    throw new Error(
      dados &&
        typeof dados === "object" &&
        "error" in dados &&
        typeof dados.error === "string"
        ? dados.error
        : "Não foi possível carregar os dados. Tente novamente.",
    );
  if (dados === null)
    throw new Error("Resposta inválida do servidor. Tente novamente.");
  return dados as T;
}
