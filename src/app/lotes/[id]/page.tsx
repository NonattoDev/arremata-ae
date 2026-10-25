import { SalaLote } from "@/funcionalidades/leiloes/sala-lote";
export default async function Pagina({
  params: parametros,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await parametros;
  return <SalaLote id={id} />;
}
