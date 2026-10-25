import assert from "node:assert/strict";

// Verificação explícita: cria lotes e depósitos simulados no endereço selecionado.
const base = process.env.SMOKE_BASE_URL || "http://localhost:4168";
const senha = process.env.DEMO_PASSWORD;
if (!senha)
  throw new Error("Defina DEMO_PASSWORD no arquivo de ambiente do destino.");
async function chamar(
  caminho: string,
  corpo?: unknown,
  cookie?: string,
  origem = base,
) {
  const resposta = await fetch(`${base}/api/${caminho}`, {
    method: corpo === undefined ? "GET" : "POST",
    headers: {
      ...(corpo === undefined
        ? {}
        : { "Content-Type": "application/json", Origin: origem }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });
  return { response: resposta, data: await resposta.json() };
}
async function entrar(email: string) {
  const resultado = await chamar("auth/login", { email, password: senha });
  assert.equal(resultado.response.status, 200);
  assert.match(resultado.response.headers.get("set-cookie") || "", /HttpOnly/i);
  return resultado.response.headers.get("set-cookie")!.split(";")[0];
}
async function principal() {
  const leiloeiro = await entrar("leiloeiro@arremata.test");
  const ana = await entrar("ana@arremata.test");
  const bruno = await entrar("bruno@arremata.test");
  assert.equal(
    (await chamar("wallet", { amount: 100 }, ana, "https://invalid.example"))
      .response.status,
    403,
  );
  assert.equal((await chamar("wallet")).response.status, 401);
  assert.equal(
    (await chamar("wallet", { amount: 100 }, leiloeiro)).response.status,
    403,
  );
  const antes = (await chamar("wallet", undefined, ana)).data.total;
  await chamar("wallet", { amount: 1000 }, ana);
  assert.equal(
    (await chamar("wallet", undefined, ana)).data.total,
    antes + 1000,
  );
  const criado = await chamar(
    "lots",
    {
      externalId: "136510",
      initial: 10000,
      increment: 1000,
      startsAt: new Date(Date.now() - 1000).toISOString(),
      endsAt: new Date(Date.now() + 135000).toISOString(),
    },
    leiloeiro,
  );
  assert.equal(criado.response.status, 201, JSON.stringify(criado.data));
  const id = criado.data.id;
  const primeiro = await chamar(`lots/${id}/bids`, { amount: 10000 }, ana);
  assert.equal(primeiro.response.status, 200);
  assert.equal(
    (await chamar(`lots/${id}/bids`, { amount: 11000 }, ana)).response.status,
    400,
  );
  assert.equal(
    (await chamar(`lots/${id}/bids`, { amount: 10500 }, bruno)).response.status,
    400,
  );
  assert.equal(
    (await chamar(`lots/${id}/bids`, { amount: 11000 }, bruno)).response.status,
    200,
  );
  assert.equal(
    (await chamar(`lots/${id}/cancel`, {}, leiloeiro)).response.status,
    400,
  );
  const sala = (await chamar(`lots/${id}`, undefined, ana)).data;
  assert.equal(sala.isLeader, false);
  assert.equal(sala.position, 2);
  const auditar = (await chamar(`audit/${id}`)).data;
  assert.equal(auditar.intact, true);
  assert.equal(auditar.bids.length, 2);
  assert.ok(!JSON.stringify(auditar).includes("@arremata.test"));
  const imagem = await fetch(`${base}/api/lots/${id}/image`);
  assert.equal(imagem.status, 200);
  assert.match(imagem.headers.get("content-type")!, /image/);
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
      closesAt: (await chamar(`lots/${id}`)).data.endsAt,
    }),
  );
}
principal().catch((erro) => {
  console.error(erro.message);
  process.exitCode = 1;
});
