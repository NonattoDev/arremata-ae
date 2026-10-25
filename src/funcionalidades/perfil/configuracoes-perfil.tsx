"use client";
import { useState, useTransition } from "react";
import { Button, Card, Tabs, Typography } from "@heroui/react";
import { AvatarUsuario } from "@/componentes/ui/avatar-usuario";
import { avatares } from "@/lib/avatares";
import { salvarAvatarAcao } from "@/servidor/actions/perfil";
import { useSessao } from "@/componentes/provedores/provedor-sessao";
import type { Usuario } from "@/tipos/leilao";
import { EditorFoto } from "@/componentes/perfil/editor-foto";
import { GaleriaAvatares } from "@/componentes/perfil/galeria-avatares";
import { DadosPerfil } from "./dados-perfil";
import { TrocaSenha } from "./troca-senha";
import { Icone } from "@/componentes/ui/icone";

export function ConfiguracoesPerfil({ usuario }: { usuario: Usuario }) {
  const sessao = useSessao();
  const [escolhido, escolher] = useState(usuario.avatar || "avatar-1");
  const [mensagem, informar] = useState("");
  const [salvando, iniciar] = useTransition();
  const [editandoFoto, definirEdicaoFoto] = useState(false);
  function salvar() {
    iniciar(async () => {
      informar("");
      try {
        const resultado = await salvarAvatarAcao(escolhido);
        if (!resultado.success) {
          informar(resultado.error);
          return;
        }
        await sessao.atualizar();
        informar("Avatar atualizado!");
      } catch {
        informar("Não foi possível salvar. Tente novamente.");
      }
    });
  }
  return (
    <Card className="mx-auto w-full max-w-xl gap-6 p-5 sm:p-8">
      <Card.Header className="items-center gap-3 text-center">
        <AvatarUsuario nome={usuario.name} avatar={usuario.avatar} grande />
        <Card.Title>{usuario.name}</Card.Title>
        <Card.Description>
          {usuario.role === "seller" ? "Leiloeiro" : "Licitante"}
        </Card.Description>
      </Card.Header>
      <Tabs defaultSelectedKey="dados">
        <Tabs.ListContainer className="mb-5 w-full">
          <Tabs.List
            aria-label="Configurações do perfil"
            className="flex w-full flex-nowrap"
          >
            <Tabs.Tab id="dados" className="h-11 min-w-0 flex-1 gap-1 px-2 text-sm">
              <Icone nome="pessoa" /> Dados
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="imagem" className="h-11 min-w-0 flex-1 gap-1 px-2 text-sm">
              <Icone nome="imagem" /> Imagem
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="senha" className="h-11 min-w-0 flex-1 gap-1 px-2 text-sm">
              <Icone nome="senha" /> Senha
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
        <Tabs.Panel id="dados">
          <DadosPerfil usuario={usuario} />
        </Tabs.Panel>
        <Tabs.Panel id="imagem" className="flex flex-col gap-5">
          <EditorFoto
            ocupado={salvando}
            aoEditar={definirEdicaoFoto}
            aoSalvar={async (foto) => {
              escolher(foto);
              informar("");
              await sessao.atualizar();
            }}
          />
          <Card.Content className="items-center gap-2">
            <AvatarUsuario nome="prévia" avatar={escolhido} grande />
            <Typography className="text-xs text-muted">
              Prévia da escolha
            </Typography>
          </Card.Content>
          <GaleriaAvatares
            escolhido={escolhido}
            escolher={(avatar) => {
              escolher(avatar);
              informar("");
            }}
            desabilitado={salvando || editandoFoto}
          />
          <Typography role="status" className="text-sm">
            {mensagem}
          </Typography>
          <Button
            onPress={salvar}
            isPending={salvando}
            isDisabled={editandoFoto || !avatares.includes(escolhido)}
          >
            Salvar
          </Button>
        </Tabs.Panel>
        <Tabs.Panel id="senha">
          <TrocaSenha />
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
