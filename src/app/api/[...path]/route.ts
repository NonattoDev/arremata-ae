import { commandContext } from "@/server/commands/context";
import { authenticate, logout, sessionCookie } from "@/server/commands/auth";
import {
  deposit,
  createLot,
  placeBid,
  cancelLot,
} from "@/server/commands/market";
import { publicError } from "@/server/errors";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";

import { DomainError } from "@/server/auction";
import { rateLimit } from "@/server/security";
import { searchArt } from "@/server/catalog";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
type Context = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, ctx: Context) {
  const path = (await ctx.params).path;
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  try {
    const token = req.cookies.get("arremata_session")?.value;
    const context = await commandContext(token);
    const { db, service, user } = context;
    if (path.join("/") === "cron/settle") {
      const expected = `Bearer ${process.env.CRON_SECRET || ""}`;
      const received = req.headers.get("authorization") || "";
      if (
        !process.env.CRON_SECRET ||
        received.length !== expected.length ||
        !timingSafeEqual(Buffer.from(received), Buffer.from(expected))
      )
        throw new DomainError("Não autorizado.", 401);
      const result = await service.settle();
      await db.query("DELETE FROM sessions WHERE expires_at < now()");
      await db.query("DELETE FROM rate_limits WHERE resets_at < now()");
      return json(result);
    }
    if (req.method !== "GET") {
      const origin = req.headers.get("origin");
      const allowed = [req.nextUrl.origin, process.env.APP_URL].filter(Boolean);
      if (!origin || !allowed.includes(origin))
        throw new DomainError("Origem da requisição inválida.", 403);
      if (Number(req.headers.get("content-length") || 0) > 16000)
        throw new DomainError("Requisição muito grande.", 413);
    }
    if (path[0] === "me") return json({ user: user || null });
    if (path[0] === "auth" && req.method === "POST") {
      const res = json({ ok: true });
      if (path[1] === "logout") {
        await logout(context);
        res.cookies.delete("arremata_session");
      } else if (path[1] === "login" || path[1] === "register") {
        const ip =
          req.headers.get("x-vercel-forwarded-for") ||
          req.headers.get("x-forwarded-for") ||
          "local";
        res.cookies.set(
          "arremata_session",
          await authenticate(context, path[1], await req.json(), ip),
          sessionCookie,
        );
      } else throw new DomainError("Rota não encontrada.", 404);
      return res;
    }
    if (req.method === "GET") {
      if (path[0] === "lots" && path[2] === "image") {
        const [lot] = await db.query("SELECT item FROM lots WHERE id=$1", [
          z.uuid().parse(path[1]),
        ]);
        if (!lot) throw new DomainError("Imagem não encontrada.", 404);
        const bytes = Buffer.from(lot.item.image.split(",")[1], "base64");
        return new Response(bytes, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=86400, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      }
      if (path[0] === "lots" && path.length === 1)
        return json(await service.listLots(user?.id));
      if (path[0] === "lots" && path.length === 2)
        return json(await service.getLot(z.uuid().parse(path[1]), user?.id));
      if (path[0] === "audit")
        return json(await service.audit(z.uuid().parse(path[1])));
      if (path[0] === "receipts")
        return json(await service.receipt(z.uuid().parse(path[1])));
    }
    if (!user) throw new DomainError("Entre na sua conta para continuar.", 401);
    if (req.method === "GET") {
      if (path[0] === "wallet") return json(await service.wallet(user.id));
      if (path[0] === "mine")
        return json(
          await service.listLots(
            user.id,
            user.role === "seller" ? "seller" : "mine",
          ),
        );
      if (path[0] === "catalog" && user.role === "seller") {
        await rateLimit(db, `catalog:${user.id}`, 20);
        return json(
          await searchArt(
            (req.nextUrl.searchParams.get("q") || "").slice(0, 80),
          ),
        );
      }
    }
    if (req.method === "POST") {
      const body = await req.json();
      if (path[0] === "wallet") return json(await deposit(context, body));
      if (path[0] === "lots" && path.length === 1)
        return json(await createLot(context, body), 201);
      if (path[0] === "lots" && path[2] === "bids")
        return json(await placeBid(context, path[1], body));
      if (path[0] === "lots" && path[2] === "cancel")
        return json(await cancelLot(context, path[1]));
    }
    throw new DomainError("Rota não encontrada.", 404);
  } catch (error) {
    const failure = publicError(error);
    return json({ error: failure.error }, failure.status);
  }
}
export const GET = handler;
export const POST = handler;
