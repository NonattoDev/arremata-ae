"use client";
import { Card, Link, Typography } from "@heroui/react";

export function preenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined || valor === "") return false;
  if (Array.isArray(valor)) return valor.some(preenchido);
  if (typeof valor === "object") return Object.values(valor).some(preenchido);
  return true;
}

const rotulos: Record<string, string> = {
  description: "Descrição",
  biography: "Biografia",
  role: "Papel",
  birth_year: "Nascimento",
  death_year: "Falecimento",
  name_in_original_language: "Nome original",
  qualifier: "Atribuição",
  extent: "Participação",
  title: "Título",
  inscription: "Inscrição",
  inscription_translation: "Tradução",
  inscription_remark: "Observação",
  opening_date: "Abertura",
  current: "Registros de exposições",
  legacy: "Arquivo histórico",
  citation: "Referência",
  citations: "Referências",
  page_number: "Página",
  url: "Link",
  date: "Data",
  footnotes: "Notas",
  framed: "Com moldura",
  unframed: "Sem moldura",
  height: "Altura",
  width: "Largura",
  depth: "Profundidade",
  web: "Imagem para web",
  print: "Imagem para impressão",
  full: "Arquivo original",
  annotation: "Anotação",
  filesize: "Tamanho do arquivo (bytes)",
  filename: "Arquivo",
  date_created: "Criado em",
  id: "Identificação",
  sortorder: "Ordem",
  weight: "Ordenação do autor (não é peso físico)",
  use_in_caption: "Usar na legenda",
  include_extent: "Incluir participação",
};

export function CampoAcervo({
  valor,
  rotulo,
}: {
  valor: unknown;
  rotulo?: string;
}) {
  if (!preenchido(valor)) return null;
  if (Array.isArray(valor))
    return (
      <Card.Content className="gap-4">
        {rotulo && <Card.Description>{rotulo}</Card.Description>}
        {valor.filter(preenchido).map((item, indice) => (
          <CampoAcervo key={indice} valor={item} />
        ))}
      </Card.Content>
    );
  if (typeof valor === "object")
    return (
      <Card.Content className="gap-3">
        {rotulo && <Card.Description>{rotulo}</Card.Description>}
        {Object.entries(valor as Record<string, unknown>).map(
          ([chave, item]) => (
            <CampoAcervo
              key={chave}
              rotulo={rotulos[chave] ?? chave.replaceAll("_", " ")}
              valor={item}
            />
          ),
        )}
      </Card.Content>
    );
  const texto =
    typeof valor === "boolean"
      ? valor
        ? "Sim"
        : "Não"
      : String(valor)
          .replace(/<[^>]*>/g, "")
          .replaceAll("&amp;", "&")
          .replaceAll("&nbsp;", " ");
  const link = /^https?:\/\//.test(texto);
  return (
    <Card.Content className="min-w-0 gap-1">
      {rotulo && <Card.Description>{rotulo}</Card.Description>}
      {link ? (
        <Link
          href={texto}
          target="_blank"
          rel="noreferrer"
          className="break-words"
        >
          Consultar fonte
        </Link>
      ) : (
        <Typography className="break-words whitespace-pre-wrap">
          {texto}
        </Typography>
      )}
    </Card.Content>
  );
}
