import { contextoComando } from "@/servidor/comandos/contexto";
import {
  autenticar,
  sair,
  cookieSessao,
} from "@/servidor/comandos/autenticacao";
import {
  depositar,
  criarLote,
  darLance,
  cancelarLote,
} from "@/servidor/comandos/mercado";
import { erroPublico } from "@/servidor/erros";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";

import { ErroDominio } from "@/servidor/leilao";
import { limitarTentativas } from "@/servidor/seguranca";
import { buscarObras } from "@/servidor/catalogo";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ path: string[] }> };

async function tratarRequisicao(
  requisicao: NextRequest,
  contextoRota: Context,
) {
  const caminho = (await contextoRota.params).path;
  const responderJson = (dados: unknown, status = 200) =>
    NextResponse.json(dados, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  try {
    const token = requisicao.cookies.get("arremata_session")?.value;
    const contexto = await contextoComando(token);
    const { db: banco, service: servico, user: usuario } = contexto;
    if (caminho.join("/") === "cron/settle") {
      const esperado = `Bearer ${process.env.CRON_SECRET || ""}`;
      const recebido = requisicao.headers.get("authorization") || "";
      if (
        !process.env.CRON_SECRET ||
        recebido.length !== esperado.length ||
        !timingSafeEqual(Buffer.from(recebido), Buffer.from(esperado))
      )
        throw new ErroDominio("Não autorizado.", 401);
      const resultado = await servico.liquidar();
      await banco.busca("DELETE FROM sessions WHERE expires_at < now()");
      await banco.busca("DELETE FROM rate_limits WHERE resets_at < now()");
      return responderJson(resultado);
    }
    if (requisicao.method !== "GET") {
      const origem = requisicao.headers.get("origin");
      const permitidas = [
        requisicao.nextUrl.origin,
        process.env.APP_URL,
      ].filter(Boolean);
      if (!origem || !permitidas.includes(origem))
        throw new ErroDominio("Origem da requisição inválida.", 403);
      if (Number(requisicao.headers.get("content-length") || 0) > 16000)
        throw new ErroDominio("Requisição muito grande.", 413);
    }
    if (caminho[0] === "me") return responderJson({ user: usuario || null });
    if (caminho[0] === "auth" && requisicao.method === "POST") {
      const resposta = responderJson({ ok: true });
      if (caminho[1] === "logout") {
        await sair(contexto);
        resposta.cookies.delete("arremata_session");
      } else if (caminho[1] === "login" || caminho[1] === "register") {
        const ip =
          requisicao.headers.get("x-vercel-forwarded-for") ||
          requisicao.headers.get("x-forwarded-for") ||
          "local";
        resposta.cookies.set(
          "arremata_session",
          await autenticar(contexto, caminho[1], await requisicao.json(), ip),
          cookieSessao,
        );
      } else throw new ErroDominio("Rota não encontrada.", 404);
      return resposta;
    }
    if (requisicao.method === "GET") {
      if (caminho[0] === "lots" && caminho[2] === "image") {
        const [lote] = await banco.busca("SELECT item FROM lots WHERE id=$1", [
          z.uuid().parse(caminho[1]),
        ]);
        if (!lote) throw new ErroDominio("Imagem não encontrada.", 404);
        const bytes = Buffer.from(lote.item.image.split(",")[1], "base64");
        return new Response(bytes, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      if (caminho[0] === "lots" && caminho.length === 1)
        return responderJson(await servico.listarLotes(usuario?.id));
      if (caminho[0] === "lots" && caminho.length === 2)
        return responderJson(
          await servico.obterLote(z.uuid().parse(caminho[1]), usuario?.id),
        );
      if (caminho[0] === "audit")
        return responderJson(await servico.auditar(z.uuid().parse(caminho[1])));
      if (caminho[0] === "receipts")
        return responderJson(
          await servico.comprovante(z.uuid().parse(caminho[1])),
        );
    }
    if (!usuario)
      throw new ErroDominio("Entre na sua conta para continuar.", 401);
    if (requisicao.method === "GET") {
      if (caminho[0] === "wallet")
        return responderJson(await servico.carteira(usuario.id));
      if (caminho[0] === "mine")
        return responderJson(
          await servico.listarLotes(
            usuario.id,
            usuario.role === "seller" ? "seller" : "mine",
          ),
        );
      if (caminho[0] === "catalog" && usuario.role === "seller") {
        await limitarTentativas(banco, `catalog:${usuario.id}`, 20);
        return responderJson(
          await buscarObras(
            (requisicao.nextUrl.searchParams.get("q") || "").slice(0, 80),
          ),
        );
      }
    }
    if (requisicao.method === "POST") {
      const corpo = await requisicao.json();
      if (caminho[0] === "wallet")
        return responderJson(await depositar(contexto, corpo));
      if (caminho[0] === "lots" && caminho.length === 1)
        return responderJson(await criarLote(contexto, corpo), 201);
      if (caminho[0] === "lots" && caminho[2] === "bids")
        return responderJson(await darLance(contexto, caminho[1], corpo));
      if (caminho[0] === "lots" && caminho[2] === "cancel")
        return responderJson(await cancelarLote(contexto, caminho[1]));
    }
    throw new ErroDominio("Rota não encontrada.", 404);
  } catch (erro) {
    const falha = erroPublico(erro);
    return responderJson({ error: falha.error }, falha.status);
  }
}
export const GET = tratarRequisicao;
export const POST = tratarRequisicao;
