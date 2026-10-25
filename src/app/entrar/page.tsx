"use client";
import { FormularioAcesso } from "@/funcionalidades/autenticacao/formulario-acesso";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
export default function Pagina() {
  const sessao = useSessao();
  return <FormularioAcesso aoEntrar={sessao.atualizar} />;
}
