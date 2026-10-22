import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createLocalDatabase } from "../src/server/database";
import { AuctionService } from "../src/server/auction";
import { schema } from "../src/server/schema";

let db: Awaited<ReturnType<typeof createLocalDatabase>>;
let service: AuctionService;
let clock = Date.parse("2026-10-22T12:00:00Z");
let seller: string, alice: string, bob: string;
const item = {
  externalId: "27992",
  title: "Obra de teste",
  artist: "Artista",
  image: "data:image/png;base64,AA==",
  sourceUrl: "https://www.artic.edu/artworks/27992",
  date: "1888",
};
before(async () => {
  db = await createLocalDatabase();
  await db.query(schema);
  service = new AuctionService(
    db,
    "test-audit-secret-with-more-than-32-characters",
    () => clock,
  );
  seller = await service.createUser(
    "seller@test.local",
    "Vendedor",
    "hash",
    "seller",
  );
  alice = await service.createUser(
    "alice@test.local",
    "Alice",
    "hash",
    "bidder",
  );
  bob = await service.createUser("bob@test.local", "Bob", "hash", "bidder");
});
after(async () => {
  await db?.close();
});
const lot = (extra = {}) =>
  service.createLot(seller, {
    item,
    initial: 10000,
    increment: 1000,
    startsAt: new Date(clock - 1000).toISOString(),
    endsAt: new Date(clock + 600000).toISOString(),
    ...extra,
  });

test("rejects seller bidding and cross-owner cancellation", async () => {
  const id = await lot();
  await assert.rejects(service.bid(seller, id, 10000), /licitante/i);
  await assert.rejects(service.cancel(alice, id), /leiloeiro|permissão/i);
});
test("validates minimum, funds, leader and immediately releases previous leader balance", async () => {
  const id = await lot();
  await assert.rejects(service.bid(alice, id, 9000), /mínimo/i);
  await assert.rejects(service.bid(alice, id, 10000), /insuficiente/i);
  await service.deposit(alice, 100000);
  await service.deposit(bob, 100000);
  await service.bid(alice, id, 10000);
  assert.equal((await service.wallet(alice)).committed, 10000);
  await assert.rejects(service.bid(alice, id, 11000), /ganhando/i);
  await assert.rejects(service.bid(bob, id, 10500), /mínimo/i);
  await service.bid(bob, id, 11000);
  assert.equal((await service.wallet(alice)).committed, 0);
  assert.equal((await service.wallet(bob)).available, 89000);
  await assert.rejects(service.cancel(seller, id), /lances/i);
});
test("rejects invalid money, future bids and accepts exact opening instant", async () => {
  await assert.rejects(service.deposit(alice, -1), /valor/i);
  await assert.rejects(service.deposit(alice, 0.5), /valor/i);
  const id = await lot({ startsAt: new Date(clock + 1000).toISOString() });
  await assert.rejects(service.bid(alice, id, 10000), /iniciado/i);
  clock += 1000;
  await service.bid(alice, id, 10000);
});
test("concurrent equal bids accept exactly one winner", async () => {
  const id = await lot();
  const results = await Promise.allSettled([
    service.bid(alice, id, 10000),
    service.bid(bob, id, 10000),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await service.audit(id)).bids.length, 1);
});
test("simultaneous bids across different lots cannot spend the same funds twice", async () => {
  const user = await service.createUser(
    "poor@test.local",
    "Pouco saldo",
    "hash",
    "bidder",
  );
  await service.deposit(user, 10000);
  const a = await lot(),
    b = await lot();
  const results = await Promise.allSettled([
    service.bid(user, a, 10000),
    service.bid(user, b, 10000),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await service.wallet(user)).available, 0);
});
test("anti-sniping sets end two minutes after accepted late bid", async () => {
  const id = await lot({ endsAt: new Date(clock + 30000).toISOString() });
  await service.bid(alice, id, 10000);
  assert.equal(
    new Date((await service.getLot(id)).endsAt).getTime(),
    clock + 120000,
  );
});
test("settles once, rejects bids exactly at end and creates anonymous receipt", async () => {
  const id = await lot({ endsAt: new Date(clock + 130000).toISOString() });
  await service.bid(bob, id, 10000);
  clock += 130000;
  await assert.rejects(service.bid(alice, id, 20000), /encerrado/i);
  await Promise.all([service.settle(), service.settle()]);
  const transfers = await db.query(
    "SELECT amount,kind FROM ledger WHERE lot_id=$1 ORDER BY amount",
    [id],
  );
  assert.deepEqual(
    transfers.map((r: any) => [Number(r.amount), r.kind]),
    [
      [-10000, "purchase"],
      [10000, "sale"],
    ],
  );
  const receipt = await service.receipt(id);
  assert.equal(receipt.amount, 10000);
  assert.ok(!JSON.stringify(receipt).includes("bob@test.local"));
  assert.ok(!JSON.stringify(receipt).includes("Bob"));
});
test("closes empty lots without winner and hides cancelled lots", async () => {
  const id = await lot({ endsAt: new Date(clock + 1000).toISOString() });
  const cancelled = await lot();
  await service.cancel(seller, cancelled);
  clock += 1000;
  await service.settle();
  assert.equal((await service.getLot(id)).status, "closed");
  await assert.rejects(service.receipt(id), /arremate/i);
  assert.ok(!(await service.listLots()).some((l) => l.id === cancelled));
});
test("audit detects SQL edits, middle deletion, tail deletion and injected bids", async () => {
  for (const mutation of [
    "UPDATE bids SET amount = amount + 1 WHERE lot_id = $1",
    "DELETE FROM bids WHERE lot_id = $1 AND sequence = 1",
    "DELETE FROM bids WHERE lot_id = $1 AND sequence = 2",
    "INSERT INTO bids (id,lot_id,bidder_id,alias,amount,sequence,placed_at,previous_hash,hash) SELECT id || 'x',lot_id,bidder_id,alias,amount,3,placed_at,previous_hash,hash FROM bids WHERE lot_id=$1 AND sequence=2",
  ]) {
    const id = await lot();
    await service.bid(alice, id, 10000);
    await service.bid(bob, id, 11000);
    assert.equal((await service.audit(id)).intact, true);
    await db.query(mutation, [id]);
    assert.equal((await service.audit(id)).intact, false);
  }
});
test("seller receipts above the deposit cap do not block settlement of other lots", async () => {
  await db.query("UPDATE users SET balance=1000000000000 WHERE id=$1", [
    seller,
  ]);
  const id = await lot({ endsAt: new Date(clock + 130000).toISOString() });
  await service.bid(alice, id, 10000);
  clock += 130000;
  await service.settle();
  assert.equal((await service.receipt(id)).amount, 10000);
  assert.ok((await service.wallet(seller)).total > 1000000000000);
  assert.ok(Array.isArray(await service.listLots()));
});
