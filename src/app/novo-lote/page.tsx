"use client";
import { CriarLote } from "@/funcionalidades/leiloes/criar-lote";
import { AreaProtegida } from "@/funcionalidades/autenticacao/area-protegida";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
export default function Pagina() {
  const sessao = useSessao();
  const usuario = sessao.dados?.user;
  return (
    <AreaProtegida autenticacao={sessao}>
      {usuario && <CriarLote usuario={usuario} />}
    </AreaProtegida>
  );
}
