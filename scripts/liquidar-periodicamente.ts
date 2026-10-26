import { setTimeout as esperar } from "node:timers/promises";
import { bancoDados } from "../src/servidor/banco";
import { ServicoLeiloes } from "../src/servidor/leilao";

// O Compose não tem o cron da Vercel. Este processo encerra lotes mesmo sem visitas.
async function principal() {
  const banco = await bancoDados();
  const servico = new ServicoLeiloes(banco, process.env.AUDIT_SECRET || "");
  let executando = true;
  const interrupcao = new AbortController();
  const parar = () => {
    executando = false;
    interrupcao.abort();
  };
  process.once("SIGTERM", parar);
  process.once("SIGINT", parar);
  try {
    while (executando) {
      try {
        console.log("Liquidação:", await servico.liquidar());
      } catch {
        console.error(
          "Não foi possível liquidar agora. Nova tentativa em um minuto.",
        );
      }
      await esperar(60000, undefined, { signal: interrupcao.signal }).catch(
        () => {},
      );
    }
  } finally {
    await banco.fechar();
  }
}
principal().catch(() => {
  console.error("Falha ao iniciar a liquidação.");
  process.exitCode = 1;
});
