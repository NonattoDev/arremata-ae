export async function api<T>(url: string): Promise<T> {
  const response = await fetch(`/api/${url}`, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Não foi possível carregar os dados.");
  return data;
}
