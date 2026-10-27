"use client";
import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import { Accordion, Button, Card, Link, Spinner } from "@heroui/react";
import { CampoAcervo, preenchido } from "./campo-acervo";
import { VisualizadorObra } from "./visualizador-obra";

const secoes: [string, Record<string, string>][] = [
  [
    "Ficha técnica",
    {
      technique: "Técnica",
      support_materials: "Materiais e suporte",
      measurements: "Medidas informadas pelo museu",
      culture: "Origem cultural",
      type: "Tipo de obra",
      creation_date: "Data",
      state_of_the_work: "Estado da obra",
      edition_of_the_work: "Edição",
      impression: "Impressão",
      inscriptions: "Inscrições",
    },
  ],
  [
    "História e curiosidades",
    {
      description: "Sobre a obra",
      did_you_know: "Você sabia?",
      early_education_description: "Conteúdo educativo",
      artlens_description: "Descrição ArtLens",
      tombstone: "Registro resumido",
    },
  ],
  [
    "Sobre os artistas",
    { creators: "Autores", artists_tags: "Classificação dos autores" },
  ],
  [
    "Procedência e conservação",
    {
      provenance: "Histórico de propriedade",
      find_spot: "Local de descoberta",
      conservation_statement: "Conservação",
      has_conservation_images: "Possui imagens de conservação",
      is_nazi_era_provenance: "Pesquisa de procedência da era nazista",
    },
  ],
  [
    "Exposições e acervo",
    {
      exhibitions: "Exposições",
      current_location: "Localização no museu",
      department: "Departamento",
      collection: "Coleção",
      on_loan: "Emprestada",
      recently_acquired: "Aquisição recente",
      is_highlight: "Destaque do museu",
      accession_date: "Entrada no acervo",
      legal_status: "Situação no acervo",
    },
  ],
  [
    "Referências e obras relacionadas",
    {
      citations: "Bibliografia",
      external_resources: "Recursos externos",
      related_works: "Obras relacionadas",
      alternate_titles: "Outros títulos",
      sketchfab_url: "Modelo 3D",
    },
  ],
  [
    "Créditos e direitos",
    {
      creditline: "Crédito de aquisição",
      image_credit: "Crédito da imagem",
      gallery_donor_text: "Crédito da galeria",
      copyright: "Direitos autorais",
      share_license_status: "Licença",
    },
  ],
  [
    "Registro completo e arquivos",
    {
      id: "Identificação",
      accession_number: "Número no acervo",
      former_accession_numbers: "Números anteriores",
      cover_accession_number: "Registro associado",
      athena_id: "Identificação Athena",
      record_type: "Tipo de registro",
      creation_date_earliest: "Data inicial estimada",
      creation_date_latest: "Data final estimada",
      date_text: "Data textual",
      sortable_date: "Data de ordenação",
      dimensions: "Dimensões estruturadas",
      images: "Arquivos da imagem principal",
      alternate_images: "Arquivos das imagens alternativas",
      sketchfab_id: "Identificação 3D",
      collapse_artists: "Agrupamento de autores",
      date_added_to_oa: "Inclusão no acervo aberto",
      updated_at: "Atualização do registro",
      url: "Página oficial",
    },
  ],
];
type Imagem = { web?: { url?: string }; annotation?: string };
type Acervo = Record<string, unknown> & {
  images?: Imagem;
  alternate_images?: Imagem[];
};
const imagemSegura = (url?: string) => {
  try {
    const u = new URL(url ?? "");
    return u.protocol === "https:" &&
      u.hostname === "openaccess-cdn.clevelandart.org"
      ? u.href
      : null;
  } catch {
    return null;
  }
};

export function FichaAcervo({
  identificador,
  imagem,
  titulo,
  galeria = false,
}: {
  identificador: string;
  imagem: string;
  titulo: string;
  galeria?: boolean;
}) {
  const [selecionada, selecionar] = useState<string | null>(null);
  const { data, error, mutate } = useSWR<Acervo>(
    `/api/obras/${identificador}`,
    async (url: string) => {
      const resposta = await fetch(url);
      if (!resposta.ok) throw new Error("Detalhes indisponíveis");
      return resposta.json();
    },
    { revalidateOnFocus: false, errorRetryCount: 1, dedupingInterval: 3600000 },
  );
  const imagens = [
    ...new Set([
      imagem,
      ...(data?.alternate_images ?? [])
        .map((item) => imagemSegura(item.web?.url))
        .filter((url): url is string => !!url),
    ]),
  ];
  const conhecidas = new Set(
    secoes.flatMap(([, campos]) => Object.keys(campos)),
  );
  const extras = data
    ? Object.fromEntries(
        Object.entries(data).filter(([chave]) => !conhecidas.has(chave)),
      )
    : {};
  return (
    <Card.Content className="min-w-0 gap-4">
      {galeria && (
        <>
          <VisualizadorObra
            key={selecionada ?? imagem}
            imagem={selecionada ?? imagem}
            titulo={titulo}
          />
          {imagens.length > 1 && (
            <Card.Content
              className="flex-row gap-2 overflow-x-auto"
              aria-label="Imagens da obra"
            >
              {imagens.map((url, indice) => (
                <Button
                  key={url}
                  variant={
                    (selecionada ?? imagem) === url ? "primary" : "secondary"
                  }
                  aria-pressed={(selecionada ?? imagem) === url}
                  aria-label={
                    indice === 0
                      ? "Imagem principal"
                      : `Ver imagem alternativa ${indice}`
                  }
                  onPress={() => selecionar(url)}
                  className="h-20 w-24 shrink-0 p-2"
                >
                  <Image
                    src={url}
                    alt={
                      indice === 0
                        ? "Imagem principal"
                        : `Imagem alternativa ${indice}`
                    }
                    width={96}
                    height={80}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                </Button>
              ))}
            </Card.Content>
          )}
        </>
      )}
      <Card.Title>Explore a obra</Card.Title>
      <Card.Description>
        Informações originais do Cleveland Museum of Art. Textos preservados no
        idioma da fonte.
      </Card.Description>
      {!data && !error && (
        <Card.Content role="status" className="flex-row items-center gap-2">
          <Spinner size="sm" /> Consultando o acervo…
        </Card.Content>
      )}
      {error && (
        <Card.Content role="status" className="gap-2">
          <Card.Description>
            Não foi possível consultar os detalhes do museu agora.
          </Card.Description>
          <Button variant="secondary" onPress={() => void mutate()}>
            Tentar novamente
          </Button>
        </Card.Content>
      )}
      {data && (
        <Accordion
          allowsMultipleExpanded
          defaultExpandedKeys={["Ficha técnica"]}
        >
          {secoes
            .filter(([, campos]) =>
              Object.keys(campos).some((chave) => preenchido(data[chave])),
            )
            .map(([nome, campos]) => (
              <Accordion.Item key={nome} id={nome}>
                <Accordion.Heading>
                  <Accordion.Trigger>
                    {nome}
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body className="flex flex-col gap-5">
                    {Object.entries(campos)
                      .filter(([chave]) => preenchido(data[chave]))
                      .map(([chave, rotulo]) => (
                        <Card
                          variant="secondary"
                          key={chave}
                          className="min-w-0 gap-2 p-4"
                        >
                          <Card.Title>{rotulo}</Card.Title>
                          <CampoAcervo valor={data[chave]} />
                        </Card>
                      ))}
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          {preenchido(extras) && (
            <Accordion.Item id="adicionais">
              <Accordion.Heading>
                <Accordion.Trigger>
                  Outros dados do museu
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  <CampoAcervo valor={extras} />
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          )}
        </Accordion>
      )}
      <Link
        href={`https://openaccess-api.clevelandart.org/api/artworks/${identificador}`}
        target="_blank"
        rel="noreferrer"
      >
        Consultar registro original completo
      </Link>
    </Card.Content>
  );
}
