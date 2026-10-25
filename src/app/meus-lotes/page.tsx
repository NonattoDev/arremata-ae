"use client";
import { MeusLotes } from "@/funcionalidades/leiloes/meus-lotes";
import { AreaProtegida } from "@/funcionalidades/autenticacao/area-protegida";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
export default function Pagina() {
  const sessao = useSessao();
  const usuario = sessao.dados?.user;
  return (
    <AreaProtegida autenticacao={sessao}>
      {usuario && <MeusLotes usuario={usuario} />}
    </AreaProtegida>
  );
}
