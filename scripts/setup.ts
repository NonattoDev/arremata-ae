import { bancoDados } from "../src/servidor/banco";
import { esquema } from "../src/servidor/esquema";
import { ServicoLeiloes } from "../src/servidor/leilao";
import { gerarHashSenha } from "../src/servidor/seguranca";
import { importarObra } from "../src/servidor/catalogo";

async function principal() {
  const banco = await bancoDados();
  try {
    // Em produção, Prisma Migrate prepara o esquema; o seed só insere os dados iniciais.
    if (!process.env.DATABASE_URL) await banco.busca(esquema);
    const senha = process.env.DEMO_PASSWORD;
    if (!senha || senha.length < 12)
      throw new Error("Defina DEMO_PASSWORD com pelo menos 12 caracteres.");
    const servico = new ServicoLeiloes(banco, process.env.AUDIT_SECRET || "");
    const usuarios: Record<string, string> = {};
    for (const [email, nome, papel] of [
      ["leiloeiro@arremata.test", "Galeria aê", "seller"],
      ["ana@arremata.test", "Ana", "bidder"],
      ["bruno@arremata.test", "Bruno", "bidder"],
    ] as const) {
      const [existente] = await banco.busca<{ id: string }>(
        "SELECT id FROM users WHERE email=$1",
        [email],
      );
      usuarios[papel === "seller" ? "seller" : nome] =
        existente?.id ||
        (await servico.criarUsuario(
          email,
          nome,
          await gerarHashSenha(senha),
          papel,
        ));
      if (!existente && papel === "bidder") {
        // Somente contas demonstrativas novas recebem a identidade fictícia.
        // Não sobrescrever CPF/nascimento de contas já existentes no seed.
        await banco.busca(
          "UPDATE users SET cpf=$1, nascimento=$2::date WHERE id=$3",
          ["52998224725", "1990-01-01", usuarios[nome]],
        );
        await servico.depositar(usuarios[nome], 500000);
      }
    }
    const [ativo] = await banco.busca(
      "SELECT id FROM lots WHERE status='open' AND ends_at > now() LIMIT 1",
    );
    if (!ativo) {
      for (const [indice, idExterno] of [
        "136510",
        "95272",
        "135382",
      ].entries()) {
        const item = await importarObra(idExterno);
        await servico.criarLote(usuarios.seller, {
          item,
          initial: (indice + 1) * 10000,
          increment: 1000,
          startsAt: new Date(
            Date.now() + (indice === 2 ? 86400000 : -60000),
          ).toISOString(),
          endsAt: new Date(
            Date.now() + (indice + 1) * 7 * 86400000,
          ).toISOString(),
        });
      }
    }
    console.log(
      "Banco preparado: leiloeiro@arremata.test, ana@arremata.test, bruno@arremata.test. Senha: a definida em DEMO_PASSWORD.",
    );
  } finally {
    await banco.fechar();
  }
}
principal().catch((erro) => {
  console.error(erro.message);
  process.exitCode = 1;
});
