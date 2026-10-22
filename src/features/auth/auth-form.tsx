"use client";
import { runAction } from "@/lib/run-action";
import { registerAction, loginAction } from "@/server/actions/auth";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Form,
  Label,
  Link,
  Radio,
  RadioGroup,
  Typography,
} from "@heroui/react";

import { Notice } from "@/components/ui/notice";
import { Field } from "@/components/ui/field";
export function Auth({
  onLogin,
  register = false,
}: {
  onLogin: () => Promise<void>;
  register?: boolean;
}) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const router = useRouter();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await runAction(() =>
        register ? registerAction(values) : loginAction(values),
      );
      await onLogin();
      router.push("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card className="mx-auto w-full max-w-lg">
      <Card.Header>
        <Typography.Heading level={1}>
          {register ? "Criar conta" : "Entrar"}
        </Typography.Heading>
        <Card.Description>
          {register
            ? "Cadastre-se como licitante ou leiloeiro."
            : "Acesse sua conta com e-mail e senha."}
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex min-w-0 flex-col gap-4">
        <Form onSubmit={submit} className="flex flex-col gap-4">
          {register && (
            <>
              <Field
                name="name"
                label="Seu nome"
                required
                minLength={2}
                maxLength={80}
                autoComplete="name"
              />
              <RadioGroup name="role" defaultValue="bidder" isRequired>
                <Label>Quero participar como</Label>
                <Radio value="bidder">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>Licitante — dar lances</Label>
                  </Radio.Content>
                </Radio>
                <Radio value="seller">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>Leiloeiro — publicar lotes</Label>
                  </Radio.Content>
                </Radio>
              </RadioGroup>
            </>
          )}
          <Field
            name="email"
            label="E-mail"
            type="email"
            placeholder="voce@exemplo.com"
            required
            autoComplete="email"
          />
          <Field
            name="password"
            label="Senha"
            type="password"
            minLength={12}
            maxLength={128}
            required
            autoComplete={register ? "new-password" : "current-password"}
            placeholder="Pelo menos 12 caracteres"
          />
          {error && <Notice>{error}</Notice>}
          <Button type="submit" fullWidth isPending={busy}>
            {register ? "Criar minha conta" : "Entrar"}
          </Button>
        </Form>
      </Card.Content>
      <Card.Footer className="flex flex-wrap items-center gap-3">
        <Link href={register ? "/entrar" : "/cadastro"}>
          {register ? "Já tem conta? Entrar" : "Não tem conta? Criar conta"}
        </Link>
      </Card.Footer>
    </Card>
  );
}
