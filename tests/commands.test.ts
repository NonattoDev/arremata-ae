import { test } from "node:test";
import assert from "node:assert/strict";
import { createLocalDatabase } from "../src/server/database";
import { AuctionService, DomainError } from "../src/server/auction";
import { schema } from "../src/server/schema";
import { deposit, createLot } from "../src/server/commands/market";
import type { CommandContext } from "../src/server/commands/context";
import { ZodError } from "zod";

test("shared action commands reject missing identity, wrong role and malformed amounts", async () => {
  const db = await createLocalDatabase();
  try {
    await db.query(schema);
    const service = new AuctionService(
      db,
      "commands-test-secret-with-at-least-32-characters",
    );
    const context: CommandContext = {
      db,
      service,
      token: undefined,
      user: undefined,
    };
    const status = (expected: number) => (error: unknown) =>
      error instanceof DomainError && error.status === expected;
    await assert.rejects(deposit(context, { amount: 100 }), status(401));
    const sellerId = await service.createUser(
      "seller@commands.test",
      "Seller",
      "test",
      "seller",
    );
    context.user = {
      id: sellerId,
      name: "Seller",
      email: "seller@commands.test",
      alias: "Seller",
      role: "seller",
    };
    await assert.rejects(deposit(context, { amount: 100 }), status(403));
    const bidderId = await service.createUser(
      "bidder@commands.test",
      "Bidder",
      "test",
      "bidder",
    );
    context.user = { ...context.user, id: bidderId, role: "bidder" };
    await assert.rejects(createLot(context, {}), status(403));
    await assert.rejects(deposit(context, { amount: -1 }), ZodError);
    // Caller-supplied identity is ignored; only the verified context can receive funds.
    await deposit(context, { amount: 100, userId: sellerId });
    assert.equal((await service.wallet(bidderId)).total, 100);
    assert.equal((await service.wallet(sellerId)).total, 0);
  } finally {
    await db.close();
  }
});
