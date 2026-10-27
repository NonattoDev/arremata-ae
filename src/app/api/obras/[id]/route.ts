import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^\d{1,9}$/.test(id))
    return NextResponse.json({ error: "Obra inválida." }, { status: 400 });
  try {
    const resposta = await fetch(
      `https://openaccess-api.clevelandart.org/api/artworks/${id}`,
      {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!resposta.ok) throw new Error();
    const { data } = await resposta.json();
    if (!data?.id)
      return NextResponse.json(
        { error: "Obra não encontrada." },
        { status: 404 },
      );
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Os detalhes do museu estão indisponíveis. A obra e o leilão continuam disponíveis.",
      },
      { status: 503 },
    );
  }
}
