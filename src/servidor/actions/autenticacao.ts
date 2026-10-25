"use server";

import { esquemaConfirmacaoSenha } from "@/lib/confirmacao-senha";
import { cookies, headers } from "next/headers";
import { autenticar, sair, cookieSessao } from "../comandos/autenticacao";
import { contextoAcao, resultadoAcao } from "./suporte";

async function iniciarSessao(modo: "login" | "register", entrada: unknown) {
  return resultadoAcao(async () => {
    if (modo === "register") esquemaConfirmacaoSenha.parse(entrada);
    const cabecalhos = await headers();
    const token = await autenticar(
      await contextoAcao(),
      modo,
      entrada,
      cabecalhos.get("x-vercel-forwarded-for") ||
        cabecalhos.get("x-forwarded-for") ||
        "local",
    );
    (await cookies()).set("arremata_session", token, cookieSessao);
    return { ok: true };
  });
}
export async function entrarAcao(entrada: unknown) {
  return iniciarSessao("login", entrada);
}
export async function cadastrarAcao(entrada: unknown) {
  return iniciarSessao("register", entrada);
}
export async function sairAcao() {
  return resultadoAcao(async () => {
    await sair(await contextoAcao());
    (await cookies()).delete("arremata_session");
    return { ok: true };
  });
}
