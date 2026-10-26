"use client";
import { Button, Card, Chip, Typography } from "@heroui/react";
import { CampoAcesso } from "@/funcionalidades/autenticacao/campo-acesso";
import { Icone } from "@/componentes/ui/icone";
import { bandeiraCartao } from "@/lib/cartao-teste";
export type DadosCartaoTeste = {
  nome: string;
  numero: string;
  validade: string;
  cvv: string;
};
export const cartaoVazio: DadosCartaoTeste = {
  nome: "",
  numero: "",
  validade: "",
  cvv: "",
};
export function FormularioCartao({
  dados,
  alterar,
  ocupado,
}: {
  dados: DadosCartaoTeste;
  alterar: (dados: DadosCartaoTeste) => void;
  ocupado: boolean;
}) {
  const bandeira = bandeiraCartao(dados.numero);
  const campo = (chave: keyof DadosCartaoTeste, valor: string) =>
    alterar({ ...dados, [chave]: valor });
  return (
    <Card.Content className="gap-4">
      <Card variant="secondary" className="gap-4 p-5">
        <Card.Content className="flex-row items-center justify-between">
          <Icone nome="cartao" />
          <Chip color="accent" size="sm">
            {bandeira?.niceType || "Cartão de teste"}
          </Chip>
        </Card.Content>
        <Typography className="text-lg tracking-wider tabular-nums">
          {dados.numero
            ? dados.numero.replace(/\d(?=.{4})/g, "•")
            : "•••• •••• •••• ••••"}
        </Typography>
        <Card.Description>
          {dados.nome || "NOME DO TITULAR"} · {dados.validade || "MM/AA"}
        </Card.Description>
      </Card>
      <Button
        variant="secondary"
        size="sm"
        onPress={() =>
          alterar({
            nome: "ANA TESTE",
            numero: "4111 1111 1111 1111",
            validade: "12/30",
            cvv: "123",
          })
        }
        isDisabled={ocupado}
      >
        <Icone nome="copiar" />
        Usar cartão de exemplo
      </Button>
      <CampoAcesso
        name="titular-teste"
        rotulo="Nome no cartão de teste"
        icone="pessoa"
        value={dados.nome}
        onChange={(e) => campo("nome", e.target.value)}
        maxLength={80}
        autoComplete="off"
        disabled={ocupado}
      />
      <CampoAcesso
        name="numero-teste"
        rotulo="Número do cartão de teste"
        icone="cartao"
        value={dados.numero}
        onChange={(e) =>
          campo(
            "numero",
            e.target.value
              .replace(/\D/g, "")
              .slice(0, 19)
              .replace(/(.{4})/g, "$1 ")
              .trim(),
          )
        }
        inputMode="numeric"
        autoComplete="off"
        placeholder="4111 1111 1111 1111"
        disabled={ocupado}
      />
      <Card.Content className="grid grid-cols-2 gap-3">
        <CampoAcesso
          name="validade-teste"
          rotulo="Validade"
          icone="tempo"
          value={dados.validade}
          onChange={(e) =>
            campo(
              "validade",
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 4)
                .replace(/^(\d{2})(\d)/, "$1/$2"),
            )
          }
          placeholder="MM/AA"
          inputMode="numeric"
          autoComplete="off"
          disabled={ocupado}
        />
        <CampoAcesso
          name="cvv-teste"
          rotulo="CVV"
          icone="senha"
          type="password"
          value={dados.cvv}
          onChange={(e) =>
            campo("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))
          }
          inputMode="numeric"
          autoComplete="off"
          disabled={ocupado}
        />
      </Card.Content>
      <Typography className="text-xs text-muted">
        Use dados fictícios. Os campos do cartão não são enviados nem
        armazenados.
      </Typography>
    </Card.Content>
  );
}
