import { Comprovante } from "@/funcionalidades/comprovantes/comprovante";
export default async function Pagina({
  params: parametros,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await parametros;
  return <Comprovante id={id} />;
}
