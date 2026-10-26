"use client";
import { ComprovantesDeposito } from "@/funcionalidades/carteira/comprovantes-deposito";
import { AreaProtegida } from "@/funcionalidades/autenticacao/area-protegida";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
export default function Pagina() {
  const sessao = useSessao();
  const usuario = sessao.dados?.user;
  return (
    <AreaProtegida autenticacao={sessao}>
      {usuario && <ComprovantesDeposito usuarioId={usuario.id} />}
    </AreaProtegida>
  );
}
