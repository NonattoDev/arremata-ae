"use client";

import { Icone } from "@/componentes/ui/icone";
import { ImagemObra } from "@/componentes/leiloes/imagem-obra";
import { executarAcao } from "@/lib/executar-acao";
import { criarLoteAcao } from "@/servidor/actions/lotes";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Description,
  Form,
  Label,
  Link,
  Radio,
  RadioGroup,
  SearchField,
  Input,
  Typography,
} from "@heroui/react";

import type { Usuario } from "@/tipos/leilao";
import { consultarApi } from "@/lib/api";
import { Aviso } from "@/componentes/ui/aviso";
import { Campo } from "@/componentes/ui/campo";
import { converterParaIso } from "@/lib/datas";
export function CriarLote({ usuario }: { usuario: Usuario }) {
  const roteador = useRouter();
  const [busca, definirBusca] = useState("Monet"),
    [resultados, definirResultados] = useState<
      { id: string; title: string; artist: string; image: string }[]
    >([]),
    [selecionado, definirSelecionado] = useState(""),
    [ocupado, definirOcupado] = useState(false),
    [buscando, definirBuscando] = useState(false),
    [erro, definirErro] = useState("");
  const buscar = async (evento: FormEvent) => {
    evento.preventDefault();
    definirBuscando(true);
    definirErro("");
    definirSelecionado("");
    definirResultados([]);
    try {
      const resultado = await consultarApi<typeof resultados>(
        `catalog?q=${encodeURIComponent(busca)}`,
      );
      definirResultados(resultado);
      if (!resultado.length)
        definirErro("Nenhuma obra com imagem disponível. Tente outro artista.");
    } catch (evento) {
      definirErro((evento as Error).message);
    } finally {
      definirBuscando(false);
    }
  };
  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!selecionado) {
      definirErro("Escolha uma obra no catálogo.");
      return;
    }
    definirOcupado(true);
    definirErro("");
    const valores = Object.fromEntries(new FormData(evento.currentTarget));
    try {
      const resultado = await executarAcao(() =>
        criarLoteAcao({
          externalId: selecionado,
          initial: Math.round(Number(valores.initial) * 100),
          increment: Math.round(Number(valores.increment) * 100),
          startsAt: converterParaIso(String(valores.start)),
          endsAt: converterParaIso(String(valores.end)),
        }),
      );
      roteador.push(`/lotes/${resultado.id}`);
    } catch (evento) {
      definirErro((evento as Error).message);
    } finally {
      definirOcupado(false);
    }
  };
  if (usuario.role !== "seller")
    return <Aviso>Apenas leiloeiros podem criar lotes.</Aviso>;
  return (
    <Card className="min-w-0 gap-6 p-5 sm:p-8">
      <Card.Header>
        <Link href="/meus-lotes">
          <Icone nome="voltar" />
          Meus lotes
        </Link>
        <Typography.Heading level={1}>Criar lote</Typography.Heading>
        <Card.Description>
          Escolha uma obra em domínio público do Cleveland Museum of Art.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Form onSubmit={buscar} className="flex flex-col gap-4">
          <SearchField value={busca} onChange={definirBusca} maxLength={80}>
            <Label>Buscar no catálogo</Label>
            <Input placeholder="Nome da obra ou artista" />
          </SearchField>
          <Button type="submit" isPending={buscando}>
            <Icone nome="buscar" /> Buscar obras
          </Button>
        </Form>
      </Card.Content>
      {erro && <Aviso>{erro}</Aviso>}
      {resultados.length > 0 && (
        <RadioGroup
          aria-label="Escolha uma obra"
          className="grid max-h-[32rem] gap-4 overflow-y-auto p-1 md:grid-cols-2 xl:grid-cols-3"
          value={selecionado}
          onChange={definirSelecionado}
        >
          {resultados.map((resultado) => (
            <Card key={resultado.id}>
              <Card.Content className="flex min-w-0 flex-col gap-4">
                <ImagemObra
                  src={resultado.image}
                  alt={resultado.title}
                  compacta
                />
                <Radio
                  value={resultado.id}
                  className="flex-row items-start gap-3"
                >
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>{resultado.title}</Label>
                    <Description>{resultado.artist}</Description>
                  </Radio.Content>
                </Radio>
              </Card.Content>
            </Card>
          ))}
        </RadioGroup>
      )}
      {selecionado && (
        <Aviso sucesso>
          Obra selecionada:{" "}
          {resultados.find((obra) => obra.id === selecionado)?.title}
        </Aviso>
      )}
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Form onSubmit={enviar} className="flex flex-col gap-4">
          <Typography.Heading level={2}>Condições do lote</Typography.Heading>
          <Campo
            name="initial"
            label="Lance inicial (R$)"
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            defaultValue="100"
            required
          />
          <Campo
            name="increment"
            label="Incremento mínimo (R$)"
            type="number"
            min="0.01"
            max="10000000"
            step="0.01"
            defaultValue="10"
            required
          />
          <Campo
            name="start"
            label="Início (seu horário local)"
            type="datetime-local"
            required
          />
          <Campo
            name="end"
            label="Encerramento (seu horário local)"
            type="datetime-local"
            required
          />
          <Typography.Paragraph size="sm">
            Ao publicar, salvamos os dados e a imagem da obra. Seu lote continua
            disponível mesmo se a API estiver fora do ar. Lotes com lances não
            podem ser cancelados.
          </Typography.Paragraph>
          <Button type="submit" isDisabled={!selecionado} isPending={ocupado}>
            <Icone nome="adicionar" /> Publicar lote
          </Button>
        </Form>
      </Card.Content>
    </Card>
  );
}
