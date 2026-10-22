import { database } from "../src/server/database";
import { schema } from "../src/server/schema";
import { AuctionService } from "../src/server/auction";
import { hashPassword } from "../src/server/security";
import { importArt } from "../src/server/catalog";

async function main() {
  const db = await database();
  try {
    await db.query(schema);
    const password = process.env.DEMO_PASSWORD;
    if (!password || password.length < 12)
      throw new Error("Defina DEMO_PASSWORD com pelo menos 12 caracteres.");
    const service = new AuctionService(db, process.env.AUDIT_SECRET || "");
    const users: Record<string, string> = {};
    for (const [email, name, role] of [
      ["leiloeiro@arremata.test", "Galeria aê", "seller"],
      ["ana@arremata.test", "Ana", "bidder"],
      ["bruno@arremata.test", "Bruno", "bidder"],
    ] as const) {
      const [existing] = await db.query("SELECT id FROM users WHERE email=$1", [
        email,
      ]);
      users[role === "seller" ? "seller" : name] =
        existing?.id ||
        (await service.createUser(
          email,
          name,
          await hashPassword(password),
          role,
        ));
      if (!existing && role === "bidder")
        await service.deposit(users[name], 500000);
    }
    const [active] = await db.query(
      "SELECT id FROM lots WHERE status='open' AND ends_at > now() LIMIT 1",
    );
    if (!active) {
      for (const [index, externalId] of [
        "136510",
        "95272",
        "135382",
      ].entries()) {
        const item = await importArt(externalId);
        await service.createLot(users.seller, {
          item,
          initial: (index + 1) * 10000,
          increment: 1000,
          startsAt: new Date(
            Date.now() + (index === 2 ? 86400000 : -60000),
          ).toISOString(),
          endsAt: new Date(
            Date.now() + (index + 1) * 7 * 86400000,
          ).toISOString(),
        });
      }
    }
    console.log(
      "Banco preparado: leiloeiro@arremata.test, ana@arremata.test, bruno@arremata.test. Senha: a definida em DEMO_PASSWORD.",
    );
  } finally {
    await db.close();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
