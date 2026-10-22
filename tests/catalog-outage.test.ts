import { test } from "node:test";
import assert from "node:assert/strict";
import { createLocalDatabase } from "../src/server/database";
import { AuctionService } from "../src/server/auction";
import { searchArt, importArt } from "../src/server/catalog";
import { schema } from "../src/server/schema";

test("stored lots, rooms, audits and receipts survive a public API outage", async (t) => {
  const db = await createLocalDatabase();
  try {
    await db.query(schema);
    let clock = Date.parse("2026-10-22T12:00:00Z");
    const service = new AuctionService(
      db,
      "outage-secret-with-at-least-32-characters",
      () => clock,
    );
    const seller = await service.createUser(
      "seller@outage.test",
      "Seller",
      "hash",
      "seller",
    );
    const bidder = await service.createUser(
      "bidder@outage.test",
      "Bidder",
      "hash",
      "bidder",
    );
    const item = {
      externalId: "136510",
      title: "Obra persistida",
      artist: "Artista",
      date: "1888",
      image: "data:image/jpeg;base64,/9j/2Q==",
      sourceUrl: "https://www.clevelandart.org/art/1929.11",
    };
    const id = await service.createLot(seller, {
      item,
      initial: 10000,
      increment: 1000,
      startsAt: new Date(clock - 1000).toISOString(),
      endsAt: new Date(clock + 180000).toISOString(),
    });
    await service.deposit(bidder, 20000);
    const fetchMock = t.mock.method(globalThis, "fetch", async () => {
      throw new Error("Simulated museum outage");
    });
    await assert.rejects(searchArt("Monet"), /indisponível/i);
    await assert.rejects(importArt("136510"), /indisponível/i);
    const externalCalls = fetchMock.mock.callCount();
    assert.equal((await service.listLots()).length, 1);
    assert.equal((await service.getLot(id)).item.title, item.title);
    await service.bid(bidder, id, 10000);
    assert.equal((await service.audit(id)).intact, true);
    clock += 180000;
    await service.settle();
    assert.equal((await service.receipt(id)).amount, 10000);
    const [stored] = await db.query("SELECT item FROM lots WHERE id=$1", [id]);
    assert.equal(stored.item.image, item.image);
    assert.equal(
      fetchMock.mock.callCount(),
      externalCalls,
      "existing lots must not fetch upstream",
    );
  } finally {
    await db.close();
  }
});
