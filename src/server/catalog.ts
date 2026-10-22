import { DomainError, type Item } from "./auction";
const fields =
  "id,title,creators,creation_date,images,url,share_license_status";
async function request(url: string) {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "ArremataAe/0.1 (educational technical challenge)",
      },
    });
    if (!response.ok) throw new Error("Upstream failed");
    return response;
  } catch {
    throw new DomainError(
      "O catálogo do museu está indisponível. Tente novamente; os lotes existentes continuam funcionando.",
      503,
    );
  }
}
export async function searchArt(query: string) {
  const params = new URLSearchParams({
    q: query || "Monet",
    fields,
    limit: "12",
    cc0: "1",
    has_image: "1",
  });
  const data = await (
    await request(
      `https://openaccess-api.clevelandart.org/api/artworks/?${params}`,
    )
  ).json();
  return data.data
    .filter((r: any) => r.images?.web?.url && r.share_license_status === "CC0")
    .map((r: any) => ({
      id: String(r.id),
      title: r.title,
      artist:
        r.creators?.[0]?.description?.split(" (")[0] || "Artista desconhecido",
      image: r.images.web.url,
    }));
}
export async function importArt(id: string): Promise<Item> {
  if (!/^\d{1,9}$/.test(id)) throw new DomainError("Item inválido.");
  const { data } = await (
    await request(
      `https://openaccess-api.clevelandart.org/api/artworks/${id}?fields=${fields}`,
    )
  ).json();
  if (!data?.images?.web?.url || data.share_license_status !== "CC0")
    throw new DomainError("Escolha uma obra com imagem em domínio público.");
  const imageUrl = new URL(data.images.web.url);
  if (
    imageUrl.protocol !== "https:" ||
    imageUrl.hostname !== "openaccess-cdn.clevelandart.org"
  )
    throw new DomainError("Origem da imagem não autorizada.");
  const response = await request(imageUrl.toString());
  const buffer = Buffer.from(await response.arrayBuffer());
  if (
    buffer.length > 3 * 1024 * 1024 ||
    !response.headers.get("content-type")?.startsWith("image/jpeg")
  )
    throw new DomainError(
      "Imagem do catálogo incompatível. Escolha outra obra.",
    );
  return {
    externalId: id,
    title: data.title,
    artist:
      data.creators?.[0]?.description?.split(" (")[0] || "Artista desconhecido",
    date: data.creation_date || "Data desconhecida",
    image: `data:image/jpeg;base64,${buffer.toString("base64")}`,
    sourceUrl: data.url,
  };
}
