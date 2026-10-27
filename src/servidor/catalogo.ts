import { z } from "zod";
import { ErroDominio, type ItemCatalogo } from "./leilao";
const obraMuseu = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string(),
  creators: z.array(z.object({ description: z.string().nullish() })).nullish(),
  creation_date: z.string().nullish(),
  images: z.object({ web: z.object({ url: z.string() }).nullish() }).nullish(),
  url: z.string(),
  share_license_status: z.string().nullish(),
});
async function lerResposta<T>(
  resposta: Response,
  contrato: z.ZodType<T>,
): Promise<T> {
  const resultado = contrato.safeParse(await resposta.json().catch(() => null));
  if (!resultado.success)
    throw new ErroDominio(
      "O catálogo retornou dados incompatíveis. Tente novamente.",
      503,
    );
  return resultado.data;
}
const campos =
  "id,title,creators,creation_date,images,url,share_license_status";
async function requisitar(endereco: string) {
  try {
    const resposta = await fetch(endereco, {
      signal: AbortSignal.timeout(15000),
      headers: {
        "User-Agent": "ArremataAe/0.1 (educational technical challenge)",
      },
    });
    if (!resposta.ok) throw new Error("Upstream failed");
    return resposta;
  } catch {
    throw new ErroDominio(
      "O catálogo do museu está indisponível. Tente novamente; os lotes existentes continuam funcionando.",
      503,
    );
  }
}
export async function buscarObras(busca: string) {
  const parametros = new URLSearchParams({
    q: busca || "Monet",
    fields: campos,
    limit: "12",
    cc0: "1",
    has_image: "1",
  });
  const dados = await lerResposta(
    await requisitar(
      `https://openaccess-api.clevelandart.org/api/artworks/?${parametros}`,
    ),
    z.object({ data: z.array(obraMuseu) }),
  );
  return dados.data
    .filter(
      (resultado) =>
        resultado.images?.web?.url && resultado.share_license_status === "CC0",
    )
    .map((resultado) => ({
      id: String(resultado.id),
      title: resultado.title,
      artist:
        resultado.creators?.[0]?.description?.split(" (")[0] ||
        "Artista desconhecido",
      image: resultado.images!.web!.url,
    }));
}
export async function importarObra(id: string): Promise<ItemCatalogo> {
  if (!/^\d{1,9}$/.test(id)) throw new ErroDominio("ItemCatalogo inválido.");
  const { data: dados } = await lerResposta(
    await requisitar(
      `https://openaccess-api.clevelandart.org/api/artworks/${id}?fields=${campos}`,
    ),
    z.object({ data: obraMuseu }),
  );
  if (!dados?.images?.web?.url || dados.share_license_status !== "CC0")
    throw new ErroDominio("Escolha uma obra com imagem em domínio público.");
  const enderecoImagem = new URL(dados.images.web.url);
  if (
    enderecoImagem.protocol !== "https:" ||
    enderecoImagem.hostname !== "openaccess-cdn.clevelandart.org"
  )
    throw new ErroDominio("Origem da imagem não autorizada.");
  const resposta = await requisitar(enderecoImagem.toString());
  const conteudoImagem = Buffer.from(await resposta.arrayBuffer());
  if (
    conteudoImagem.length > 3 * 1024 * 1024 ||
    !resposta.headers.get("content-type")?.startsWith("image/jpeg")
  )
    throw new ErroDominio(
      "Imagem do catálogo incompatível. Escolha outra obra.",
    );
  return {
    externalId: id,
    title: dados.title,
    artist:
      dados.creators?.[0]?.description?.split(" (")[0] ||
      "Artista desconhecido",
    date: dados.creation_date || "Data desconhecida",
    image: `data:image/jpeg;base64,${conteudoImagem.toString("base64")}`,
    sourceUrl: dados.url,
  };
}
