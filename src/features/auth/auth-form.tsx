"use client";
import { runAction } from "@/lib/run-action";
import { registerAction, loginAction } from "@/server/actions/auth";

import { useState, type FormEvent } from "react";

import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { Notice } from "@/components/ui/notice";
import { Field } from "@/components/ui/field";
export function Auth({ onLogin }: { onLogin: () => Promise<void> }) {
  const [register, setRegister] = useState(false),
    [error, setError] = useState(""),
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
    <section className="page auth-page">
      <div className="auth-story">
        <span className="eyebrow">SEU PRÓXIMO CAPÍTULO</span>
        <h1>
          Grandes histórias
          <br />
          começam com
          <br />
          um <em>encontro.</em>
        </h1>
        <p>
          Arte, descobertas e a emoção de um lance.
          <br />
          Tudo isso te espera aqui.
        </p>
        <ShieldCheck size={40} />
        <p className="muted">
          Seu histórico é verificável.
          <br />
          Seus dados pessoais ficam protegidos.
        </p>
      </div>
      <div className="panel auth-panel">
        <span className="eyebrow">BEM-VINDO AO ARREMATA AÊ</span>
        <h2>{register ? "Crie sua conta." : "Bom te ver por aqui."}</h2>
        <p>
          {register
            ? "Escolha como você quer participar."
            : "Entre para acompanhar suas próximas conquistas."}
        </p>
        <form onSubmit={submit}>
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
              <label className="field">
                <span>Quero participar como</span>
                <select name="role">
                  <option value="bidder">Licitante — dar lances</option>
                  <option value="seller">Leiloeiro — publicar lotes</option>
                </select>
              </label>
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
          <Button
            type="submit"
            className="orange-button"
            fullWidth
            isPending={busy}
          >
            {register ? "Criar minha conta" : "Entrar"}
            <ArrowRight size={18} />
          </Button>
        </form>
        <p className="switch-auth">
          {register ? "Já tem conta?" : "Primeira vez aqui?"}{" "}
          <button
            onClick={() => {
              setRegister(!register);
              setError("");
            }}
          >
            {register ? "Entrar" : "Criar conta"}
          </button>
        </p>
        <div className="demo-note">
          Ambiente demonstrativo. Depósitos e arremates são simulados.
        </div>
      </div>
    </section>
  );
}
