import assert from "node:assert/strict";

// Opt-in smoke test. Creates demo lots/deposits on the explicitly selected target.
const base = process.env.SMOKE_BASE_URL || "http://localhost:4168";
const password = process.env.DEMO_PASSWORD;
if (!password)
  throw new Error("Defina DEMO_PASSWORD no arquivo de ambiente do destino.");
async function call(
  path: string,
  body?: unknown,
  cookie?: string,
  origin = base,
) {
  const response = await fetch(`${base}/api/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      ...(body === undefined
        ? {}
        : { "Content-Type": "application/json", Origin: origin }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { response, data: await response.json() };
}
async function login(email: string) {
  const r = await call("auth/login", { email, password });
  assert.equal(r.response.status, 200);
  assert.match(r.response.headers.get("set-cookie") || "", /HttpOnly/i);
  return r.response.headers.get("set-cookie")!.split(";")[0];
}
async function main() {
  const seller = await login("leiloeiro@arremata.test");
  const ana = await login("ana@arremata.test");
  const bruno = await login("bruno@arremata.test");
  assert.equal(
    (await call("wallet", { amount: 100 }, ana, "https://invalid.example"))
      .response.status,
    403,
  );
  assert.equal((await call("wallet")).response.status, 401);
  assert.equal(
    (await call("wallet", { amount: 100 }, seller)).response.status,
    403,
  );
  const before = (await call("wallet", undefined, ana)).data.total;
  await call("wallet", { amount: 1000 }, ana);
  assert.equal(
    (await call("wallet", undefined, ana)).data.total,
    before + 1000,
  );
  const created = await call(
    "lots",
    {
      externalId: "136510",
      initial: 10000,
      increment: 1000,
      startsAt: new Date(Date.now() - 1000).toISOString(),
      endsAt: new Date(Date.now() + 135000).toISOString(),
    },
    seller,
  );
  assert.equal(created.response.status, 201, JSON.stringify(created.data));
  const id = created.data.id;
  const first = await call(`lots/${id}/bids`, { amount: 10000 }, ana);
  assert.equal(first.response.status, 200);
  assert.equal(
    (await call(`lots/${id}/bids`, { amount: 11000 }, ana)).response.status,
    400,
  );
  assert.equal(
    (await call(`lots/${id}/bids`, { amount: 10500 }, bruno)).response.status,
    400,
  );
  assert.equal(
    (await call(`lots/${id}/bids`, { amount: 11000 }, bruno)).response.status,
    200,
  );
  assert.equal(
    (await call(`lots/${id}/cancel`, {}, seller)).response.status,
    400,
  );
  const room = (await call(`lots/${id}`, undefined, ana)).data;
  assert.equal(room.isLeader, false);
  assert.equal(room.position, 2);
  const audit = (await call(`audit/${id}`)).data;
  assert.equal(audit.intact, true);
  assert.equal(audit.bids.length, 2);
  assert.ok(!JSON.stringify(audit).includes("@arremata.test"));
  const image = await fetch(`${base}/api/lots/${id}/image`);
  assert.equal(image.status, 200);
  assert.match(image.headers.get("content-type")!, /image/);
  console.log(
    JSON.stringify({
      ok: true,
      lotId: id,
      checks: [
        "real login",
        "HttpOnly",
        "CSRF",
        "roles",
        "deposit",
        "public API import",
        "bid rules",
        "outbid position",
        "public audit",
        "stored image",
      ],
      closesAt: (await call(`lots/${id}`)).data.endsAt,
    }),
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
