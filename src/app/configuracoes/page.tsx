"use client";
import { AreaProtegida } from "@/funcionalidades/autenticacao/area-protegida";
import { ConfiguracoesPerfil } from "@/funcionalidades/perfil/configuracoes-perfil";
import { useSessao } from "@/componentes/provedores/provedor-sessao";

export default function PaginaConfiguracoes() {
  const sessao = useSessao();
  const usuario = sessao.dados?.user;
  return (
    <AreaProtegida autenticacao={sessao}>
      {usuario && <ConfiguracoesPerfil key={usuario.id} usuario={usuario} />}
    </AreaProtegida>
  );
}
