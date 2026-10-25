"use client";
import { Button, Card, Tabs, Typography } from "@heroui/react";
import { categoriasAvatares } from "@/lib/avatares";
import { AvatarUsuario } from "@/componentes/ui/avatar-usuario";
import { Icone, type NomeIcone } from "@/componentes/ui/icone";
const iconesCategorias: Record<string, NomeIcone> = {
  pessoas: "pessoa",
  grisalhos: "grisalho",
  animais: "animal",
  ilustrados: "ilustracao",
};
export function GaleriaAvatares({
  escolhido,
  escolher,
  desabilitado,
}: {
  escolhido: string;
  escolher: (avatar: string) => void;
  desabilitado: boolean;
}) {
  return (
    <Card.Content className="gap-4">
      <Typography className="font-semibold">Escolha seu avatar</Typography>
      <Tabs defaultSelectedKey="pessoas">
        <Tabs.ListContainer className="mb-4 w-full">
          <Tabs.List
            aria-label="Categorias de avatares"
            className="flex w-full flex-nowrap"
          >
            {categoriasAvatares.map((categoria) => (
              <Tabs.Tab
                key={categoria.id}
                id={categoria.id}
                aria-label={categoria.nome}

                className="h-11 min-w-0 flex-1 justify-center px-2"
              >
                <Icone
                  nome={iconesCategorias[categoria.id]}
                  titulo={categoria.nome}
                />
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
        {categoriasAvatares.map((categoria) => (
          <Tabs.Panel key={categoria.id} id={categoria.id}>
            <Card.Content
              role="group"
              aria-label={"Avatares: " + categoria.nome}
              className="grid grid-cols-4 gap-3 sm:grid-cols-6"
            >
              {categoria.itens.map((item) => (
                <Button
                  key={item.id}
                  isIconOnly
                  className="h-16 w-full rounded-2xl"
                  variant={escolhido === item.id ? "primary" : "secondary"}
                  aria-label={item.nome}
                  aria-pressed={escolhido === item.id}
                  isDisabled={desabilitado}
                  onPress={() => escolher(item.id)}
                >
                  <AvatarUsuario nome={item.nome} avatar={item.id} />
                </Button>
              ))}
            </Card.Content>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Card.Content>
  );
}
