import { ConfirmacaoPix } from "@/funcionalidades/carteira/confirmacao-pix";
export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 return <ConfirmacaoPix id={id} />;
}
