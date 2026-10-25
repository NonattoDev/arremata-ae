export async function consultarApi<T>(endereco: string): Promise<T> {
  const resposta = await fetch(`/api/${endereco}`, { cache: "no-store" });
  const dados = await resposta.json();
  if (!resposta.ok)
    throw new Error(dados.error || "Não foi possível carregar os dados.");
  return dados;
}
