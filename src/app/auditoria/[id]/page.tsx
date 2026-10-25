import { PaginaAuditoria } from "@/funcionalidades/auditoria/pagina-auditoria";
export default async function Pagina({
  params: parametros,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await parametros;
  return <PaginaAuditoria id={id} />;
}
