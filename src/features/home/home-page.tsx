"use client";

import { Card, Link, Typography } from "@heroui/react";
import { useResource } from "@/hooks/use-resource";
import { useSession } from "@/components/providers/session-provider";
import { LotCard } from "@/components/auctions/lot-card";
import { Loading } from "@/components/ui/loading";
import { Notice } from "@/components/ui/notice";
import { Empty } from "@/components/ui/empty";
import type { Lot } from "@/types/auction";

export function HomePage() {
  const { data, error } = useResource<Lot[]>("lots", true);
  const { data: session } = useSession();
  const live = data?.filter((lot) => lot.status === "live").slice(0, 3) ?? [];
  return (
    <Card>
      <Card.Header>
        <Typography.Heading level={1}>Leilões de arte</Typography.Heading>
        <Card.Description>
          Consulte as obras disponíveis e acompanhe os leilões em andamento.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-6">
        <Link href="/leiloes">Ver todos os leilões</Link>
        <Typography.Heading level={2}>Lotes ao vivo</Typography.Heading>
        {error ? (
          <Notice>{error}</Notice>
        ) : !data ? (
          <Loading />
        ) : live.length ? (
          <Card.Content className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {live.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </Card.Content>
        ) : (
          <Empty title="Nenhum leilão ao vivo no momento.">
            <Link href="/leiloes">Consultar lotes agendados e encerrados</Link>
          </Empty>
        )}
        <Typography.Heading level={2}>Acessos</Typography.Heading>
        <Card.Content className="grid gap-4 md:grid-cols-2">
          <Card>
            <Card.Header>
              <Card.Title>
                {session?.user ? "Minha conta" : "Participar dos leilões"}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <Typography.Paragraph>
                {session?.user?.role === "seller"
                  ? "Gerencie seus lotes e consulte os resultados."
                  : "Consulte seus lances e comprovantes."}
              </Typography.Paragraph>
            </Card.Content>
            <Card.Footer>
              <Link href={session?.user ? "/meus-lotes" : "/cadastro"}>
                {session?.user
                  ? session.user.role === "seller"
                    ? "Gerenciar lotes"
                    : "Ver minhas participações"
                  : "Criar conta"}
              </Link>
            </Card.Footer>
          </Card>
          <Card>
            <Card.Header>
              <Card.Title>
                {session?.user?.role === "bidder"
                  ? "Minha carteira"
                  : "Publicar um lote"}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <Typography.Paragraph>
                {session?.user?.role === "bidder"
                  ? "Consulte o saldo disponível e os valores reservados."
                  : "Selecione uma obra do catálogo e defina os valores e horários."}
              </Typography.Paragraph>
            </Card.Content>
            <Card.Footer>
              <Link
                href={
                  session?.user
                    ? session.user.role === "seller"
                      ? "/novo-lote"
                      : "/carteira"
                    : "/cadastro"
                }
              >
                {session?.user
                  ? session.user.role === "seller"
                    ? "Criar lote"
                    : "Ver carteira"
                  : "Criar conta de leiloeiro"}
              </Link>
            </Card.Footer>
          </Card>
        </Card.Content>
      </Card.Content>
    </Card>
  );
}
