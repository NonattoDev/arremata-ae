import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { createPostgresDatabase } from "../src/server/database/postgres";
import { AuctionService } from "../src/server/auction";
import { schema } from "../src/server/schema";

// Exercises Prisma -> pg -> PostgreSQL protocol, not real multi-process concurrency.
test("Prisma adapter persists bids, rolls back failures and settles signed receipts", async () => {
  const engine = await PGlite.create();
  await engine.exec(schema);
  const server = new PGLiteSocketServer({
    db: engine,
    host: "127.0.0.1",
    port: 15439,
  });
  await server.start();
  const db = createPostgresDatabase(
    "postgresql://postgres:postgres@127.0.0.1:15439/postgres?sslmode=disable",
  );
  try {
    let now = Date.parse("2026-10-22T12:00:00Z");
    const service = new AuctionService(
      db,
      "adapter-test-secret-with-at-least-32-characters",
      () => now,
    );
    const seller = await service.createUser(
      "seller@test.example",
      "Seller",
      "test",
      "seller",
    );
    const bidder = await service.createUser(
      "bidder@test.example",
      "Bidder",
      "test",
      "bidder",
    );
    await service.deposit(bidder, 1000);
    const lot = await service.createLot(seller, {
      item: {
        externalId: "1",
        title: "Snapshot",
        artist: "Artist",
        date: "1900",
        image: "data:image/jpeg;base64,AA==",
        sourceUrl: "https://example.test/art/1",
      },
      initial: 100,
      increment: 10,
      startsAt: new Date(now - 1000).toISOString(),
      endsAt: new Date(now + 600000).toISOString(),
    });
    await service.bid(bidder, lot, 100);
    assert.equal((await service.audit(lot)).intact, true);
    await assert.rejects(
      db.transaction(async (tx) => {
        await tx.query("UPDATE users SET balance=0 WHERE id=$1", [bidder]);
        throw new Error("rollback proof");
      }),
      /rollback proof/,
    );
    assert.equal((await service.wallet(bidder)).total, 1000);
    now += 600001;
    await service.settle();
    await service.settle();
    assert.equal((await service.wallet(bidder)).total, 900);
    assert.equal((await service.wallet(seller)).total, 100);
    assert.equal((await service.receipt(lot)).amount, 100);
    assert.equal((await service.audit(lot)).intact, true);
  } finally {
    await db.close();
    await server.stop();
    await engine.close();
  }
});
