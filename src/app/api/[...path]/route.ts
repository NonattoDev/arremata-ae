import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { timingSafeEqual } from "node:crypto";
import { database } from "@/server/database";
import { AuctionService, DomainError } from "@/server/auction";
import {
  hashPassword,
  verifyPassword,
  tokenHash,
  session,
  rateLimit,
} from "@/server/security";
import { searchArt, importArt } from "@/server/catalog";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const money = z.number().int().positive().max(1000000000);
const credentials = z.object({
  email: z
    .email()
    .max(200)
    .transform((s) => s.toLowerCase().trim()),
  password: z.string().min(12).max(128),
});
type Context = { params: Promise<{ path: string[] }> };

async function handler(req: NextRequest, ctx: Context) {
  const path = (await ctx.params).path;
  const json = (data: unknown, status = 200) =>
    NextResponse.json(data, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  try {
    const db = await database();
    const service = new AuctionService(db, process.env.AUDIT_SECRET || "");
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
    const token = req.cookies.get("arremata_session")?.value;
    const [user] = token
      ? await db.query(
          "SELECT u.id,u.name,u.email,u.role,u.alias FROM users u JOIN sessions s ON s.user_id=u.id WHERE s.token_hash=$1 AND s.expires_at > now()",
          [tokenHash(token)],
        )
      : [];
    if (path[0] === "me") return json({ user: user || null });
    if (path[0] === "auth" && req.method === "POST") {
      if (path[1] === "logout") {
        if (token)
          await db.query("DELETE FROM sessions WHERE token_hash=$1", [
            tokenHash(token),
          ]);
        const res = json({ ok: true });
        res.cookies.delete("arremata_session");
        return res;
      }
      const body = await req.json();
      const parsed = credentials.parse(body);
      const ip =
        req.headers.get("x-vercel-forwarded-for") ||
        req.headers.get("x-forwarded-for") ||
        "local";
      await rateLimit(db, `auth:${tokenHash(ip)}`, 20);
      await rateLimit(db, `email:${tokenHash(parsed.email)}`, 10);
      let id: string;
      if (path[1] === "register") {
        const { name, role } = z
          .object({
            name: z.string().trim().min(2).max(80),
            role: z.enum(["seller", "bidder"]),
          })
          .parse(body);
        id = await service.createUser(
          parsed.email,
          name,
          await hashPassword(parsed.password),
          role,
        );
      } else if (path[1] === "login") {
        const [account] = await db.query(
          "SELECT id,password_hash FROM users WHERE email=$1",
          [parsed.email],
        );
        if (
          !account ||
          !(await verifyPassword(parsed.password, account.password_hash))
        )
          throw new DomainError("E-mail ou senha incorretos.", 401);
        id = account.id;
      } else throw new DomainError("Rota não encontrada.", 404);
      const res = json({ ok: true });
      res.cookies.set("arremata_session", await session(db, id), {
        httpOnly: true,
        secure: !!process.env.VERCEL || process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 86400,
      });
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
      await rateLimit(db, `write:${user.id}`, 60);
      const body = await req.json();
      if (path[0] === "wallet")
        return json(
          await service.deposit(
            user.id,
            z.object({ amount: money }).parse(body).amount,
          ),
        );
      if (path[0] === "lots" && path.length === 1) {
        if (user.role !== "seller")
          throw new DomainError("Apenas leiloeiros podem criar lotes.", 403);
        const data = z
          .object({
            externalId: z.string().regex(/^\d{1,9}$/),
            initial: money,
            increment: money,
            startsAt: z.iso.datetime(),
            endsAt: z.iso.datetime(),
          })
          .parse(body);
        return json(
          {
            id: await service.createLot(user.id, {
              ...data,
              item: await importArt(data.externalId),
            }),
          },
          201,
        );
      }
      if (path[0] === "lots" && path[2] === "bids")
        return json(
          await service.bid(
            user.id,
            z.uuid().parse(path[1]),
            z.object({ amount: money }).parse(body).amount,
          ),
        );
      if (path[0] === "lots" && path[2] === "cancel") {
        await service.cancel(user.id, z.uuid().parse(path[1]));
        return json({ ok: true });
      }
    }
    throw new DomainError("Rota não encontrada.", 404);
  } catch (error) {
    if (error instanceof DomainError)
      return json({ error: error.message }, error.status);
    if (error instanceof ZodError)
      return json(
        {
          error:
            "Confira os campos: valores válidos, e-mail e senha com pelo menos 12 caracteres.",
        },
        400,
      );
    if (error instanceof SyntaxError)
      return json({ error: "Requisição inválida." }, 400);
    if ((error as { code?: string })?.code === "23505")
      return json({ error: "Este cadastro já existe." }, 409);
    console.error(
      "Request failed",
      error instanceof Error ? error.message : "unknown",
    );
    return json(
      { error: "Não foi possível concluir. Tente novamente em instantes." },
      500,
    );
  }
}
export const GET = handler;
export const POST = handler;
