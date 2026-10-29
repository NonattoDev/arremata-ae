<p align="center">
  <img src="public/brand/arremata-symbol.png" alt="Símbolo Arremata aê" width="96" />
</p>

<h1 align="center">Arremata aê</h1>

<p align="center">Leilões de arte · Desafio Elite Dev Verzel</p>

<p align="center">
  <a href="https://arremata-ae.vercel.app">Abrir aplicação</a> ·
  <a href="#rodar-com-docker">Rodar com Docker</a> ·
  <a href="#contas-de-demonstracao">Contas de acesso</a> ·
  <a href="docs/CHECKLIST-DESAFIO.md">Checklist do desafio</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-111827?style=flat-square" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/HeroUI-3-7C3AED?style=flat-square" alt="HeroUI 3" />
  <img src="https://img.shields.io/badge/PostgreSQL-17-4169E1?style=flat-square" alt="PostgreSQL 17" />
  <img src="https://img.shields.io/badge/Prisma-7-0C344B?style=flat-square" alt="Prisma 7" />
</p>

---

Obras reais do acervo aberto do **Cleveland Museum of Art**, disputas entre participantes e acompanhamento de lances enquanto você navega. O projeto reúne a experiência do licitante e a gestão do leiloeiro.

> **Ambiente de avaliação:** os depósitos e saldos são simulados. Não há cobrança real nem venda das obras do museu.

<a id="contas-de-demonstracao"></a>

## 🔑 Acesso rápido para avaliação

**[Entrar na aplicação publicada](https://arremata-ae.vercel.app/entrar)**

| Quero testar | E-mail | Senha |
| :--- | :--- | :--- |
| Publicar e gerenciar leilões | `leiloeiro@arremata.test` | `Arremata-Demo-2026!` |
| Dar lances como Ana | `ana@arremata.test` | `Arremata-Demo-2026!` |
| Disputar com outra conta, Bruno | `bruno@arremata.test` | `Arremata-Demo-2026!` |

Também é possível **[criar uma conta](https://arremata-ae.vercel.app/cadastro)** e escolher entre dar lances ou publicar lotes.

As contas acima são públicas e exclusivas da demonstração. Para disputar entre contas, use perfis de navegador separados ou uma janela anônima. O saldo pode variar conforme os testes realizados.

## ✦ O que explorar

| 🎨 Catálogo de arte | 🔨 Disputa por lotes | 💳 Carteira |
| :--- | :--- | :--- |
| Obras, artistas, filtros e detalhes do acervo. | Lances, posição e contagem regressiva. | Saldo disponível, reservas e depósitos simulados. |
| **📌 Acompanhamento** | **🧾 Resultado** | **🛡️ Integridade** |
| Miniplayer para acompanhar até cinco leilões. | Arremates, comprovantes e resultados do leiloeiro. | Histórico público e verificação das assinaturas dos lances. |

## 🧭 Para quem vai avaliar

| Quero… | Onde encontrar |
| :--- | :--- |
| Conhecer a aplicação publicada | [arremata-ae.vercel.app](https://arremata-ae.vercel.app) |
| Rodar aplicação e banco do zero | [Docker Compose](#rodar-com-docker) |
| Conferir o atendimento ao PDF | [Requisitos](docs/REQUISITOS.md) · [Checklist](docs/CHECKLIST-DESAFIO.md) |
| Entender as decisões técnicas | [Arquitetura](docs/ARQUITETURA.md) |
| Consultar evidências e limites dos testes | [Validação](docs/VALIDACAO.md) |
| Entender a participação da IA | [Organização e uso de IA](#organizacao-e-ia) |

## 🧩 Tecnologias

| Camada | Implementação |
| :--- | :--- |
| Interface | Next.js 16 App Router, React 19, TypeScript, HeroUI 3 e Tailwind CSS 4 |
| Servidor | Node.js, Server Actions para mutações e Route Handlers para consultas/polling e compatibilidade HTTP |
| Persistência | PostgreSQL 17, Prisma 7 e adapter `pg`; PGlite para desenvolvimento e testes locais |
| Autenticação | scrypt, sessões opacas armazenadas por hash e cookies HttpOnly/SameSite, Secure em produção |
| Validação | Zod, verificação de origem nas escritas e limitação de tentativas no banco |
| Publicação | Vercel na equipe NatosTech e PostgreSQL no Neon pessoal de Robson Nonato |

<a id="rodar-com-docker"></a>

## 🚀 Rodar com Docker

**Aplicação + PostgreSQL + preparação do banco + liquidação automática.**

Requisito: Docker Desktop com containers Linux ou Docker Engine com Compose v2. Não é necessário instalar Node.js nem PostgreSQL no computador.

```sh
git clone https://github.com/NonattoDev/arremata-ae.git
cd arremata-ae
```

Copie `.env.docker.example` para `.env.docker`:

```powershell
# Windows / PowerShell
Copy-Item .env.docker.example .env.docker
```

```sh
# Linux / macOS
cp .env.docker.example .env.docker
```

Depois, em qualquer terminal:

```sh
docker compose --env-file .env.docker up --build -d
docker compose --env-file .env.docker ps -a
docker compose --env-file .env.docker logs -f preparar app liquidacao
```

Abra **http://localhost:4168** quando `preparar` terminar com código 0 e `app` estiver saudável. O primeiro build pode levar alguns minutos. A preparação aguarda o PostgreSQL, aplica todas as migrations e cria as contas e três lotes de exemplo. O serviço `liquidacao` encerra lotes vencidos a cada minuto, mesmo sem ninguém acessar o site.

Entre com `leiloeiro@arremata.test`, `ana@arremata.test` ou `bruno@arremata.test`. A senha inicial do exemplo é `Arremata-Demo-2026!`, definida em `DEMO_PASSWORD`. Os licitantes começam com R$ 5.000 de saldo simulado. Contas de demonstração novas já recebem CPF de teste `529.982.247-25` e nascimento `01/01/1990`, ficando prontas para os lances e o smoke. Contas existentes não têm a identidade alterada pelo seed: se estiverem incompletas, preencha esses dados fictícios no modal antes de dar lances ou executar o smoke. Novos cadastros pela interface continuam exigindo essa etapa. Não informe dados pessoais reais.

Se a porta estiver ocupada, altere `PORTA_APP=4169` no `.env.docker`, repita `up -d` e acesse `http://localhost:4169`. A publicação fica restrita ao próprio computador. O PostgreSQL não expõe uma porta ao host.

O build requer internet para imagens Docker, npm e fontes; o primeiro seed consulta o museu. Se a preparação falhar, confira `logs preparar`, corrija a causa e execute novamente `up --build -d`. A aplicação não inicia enquanto a preparação não terminar com sucesso.

```sh
# Parar sem apagar os dados
docker compose --env-file .env.docker down
# Iniciar novamente
docker compose --env-file .env.docker up -d
```

Os dados ficam no volume `dados-postgres`. **Não use `down -v` para uma parada normal: isso apaga o banco.** Preserve também `AUDIT_SECRET` junto ao volume: trocar a chave invalida a auditoria dos lotes existentes. Reexecutar o seed não redefine senhas nem repõe saldos. As credenciais do exemplo são apenas para avaliação local; não reutilize em produção. Se personalizar a senha do banco, use letras e números para mantê-la compatível com a URL de conexão.

A imagem inclui Prisma CLI e `tsx` para executar migrations, seed e liquidação. Arquivos `.env`, dados locais e credenciais do host não entram na imagem.

## 🛠️ Instalação alternativa

<details>
<summary><strong>Executar sem Docker — ver detalhes</strong></summary>

Requisitos: Node.js 24 e npm.

```sh
git clone https://github.com/NonattoDev/arremata-ae.git
cd arremata-ae
npm ci
```

Copie `.env.example` para `.env.local`. Defina `AUDIT_SECRET` e `CRON_SECRET` com valores aleatórios diferentes, pelo menos 32 caracteres, e `DEMO_PASSWORD` com pelo menos 12 caracteres. Gere um segredo com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

Para desenvolvimento local, deixe `DATABASE_URL` vazia e mantenha `LOCAL_DATABASE_PATH=.local/postgres` (ignorado pelo Git).

```sh
npm run db:setup
npm run dev
```

Abra **http://localhost:4168**. Execute setup antes de iniciar o servidor; o PGlite em arquivo deve ter um único processo proprietário. Pare o servidor antes de reaplicar setup. PGlite não é usado na Vercel.

As contas locais são as mesmas listadas em [Acesso rápido](#contas-de-demonstracao). A senha é `DEMO_PASSWORD` do primeiro setup. O saldo inicial é R$ 5.000 para Ana e Bruno e R$ 0 para o leiloeiro. Reexecutar o setup não redefine senhas nem repõe saldo existente.

O seed importa três obras reais: duas abertas e uma agendada. Não duplica lotes se já houver lote aberto. Se todos expiraram, cria novo conjunto com datas relativas à execução. A primeira importação depende da API; lotes existentes não dependem dela.

### PostgreSQL convencional

Defina `DATABASE_URL`, execute `npm run db:migrate` e depois `npm run db:setup` (seed). O modelo está em `prisma/schema.prisma`, e as migrations versionadas em `prisma/migrations`. `npm ci` gera o cliente Prisma; `npm run db:generate` regenera após mudanças. Em desenvolvimento PostgreSQL, use `npm run db:migrate:dev` para criar novas migrations. O seed não cria tabelas em PostgreSQL remoto. Use base exclusiva e usuário com permissão para criar tabelas/índices. Configure SSL na URL conforme o provedor, sem desabilitar validação de certificado.

</details>

## 📋 Regras implementadas

- Vitrine: ao vivo, agendados e encerrados; cancelados ocultos; busca por obra/artista.
- Leiloeiro busca API pública, publica lotes com início/fim, lance inicial/incremento e gerencia somente os próprios lotes. Não pode dar lances.
- Cancelamento pelo dono do lote, antes do encerramento, inclusive com lances. A confirmação libera automaticamente a reserva do líder e retira o lote da vitrine, preservando os lances e a auditoria. Repetir o cancelamento não duplica valores. Como a reserva ainda não foi debitada, o estorno é uma liberação de saldo, não um novo depósito. Lotes encerrados não podem ser cancelados.
- Licitante deposita saldo simulado, vê total/comprometido/disponível e participa de vários lotes.
- Primeiro lance >= inicial; seguintes >= atual + incremento. Líder não cobre o próprio lance.
- Início inclusivo, fim exclusivo; relógio do servidor decide.
- Centavos inteiros. Lance/depósito individual limitado a R$ 10 milhões; saldo de depósitos limitado a R$ 10 bilhões. Recebimentos do leiloeiro não herdam esse limite.
- Liderança reserva saldo. Ao ser superado, libera na mesma transação.
- Anti-sniping: lance nos últimos dois minutos define o fim como instante do lance + dois minutos. Interpretação adotada para “estende o fim do lote para +2 minutos”.
- Liquidação única debita vencedor, credita leiloeiro e gera comprovante. Sem lances, sem vencedor/transferência.
- Sala: histórico, posição, liderança, contagem regressiva e erros específicos. Polling a cada 2 segundos, pausado em abas ocultas; respostas antigas descartadas.
- Meus arremates: participações/vitórias. Painel do leiloeiro: resultados e total recebido.
- Auditoria/comprovante públicos com aliases, sem nomes/e-mails de licitantes.

## ⚙️ Concorrência e encerramento

<details>
<summary><strong>Concorrência e encerramento — ver detalhes</strong></summary>

Operações de mercado usam transação PostgreSQL com `pg_advisory_xact_lock(215884)`, compartilhada entre instâncias Node.js. Isso protege também a mesma carteira em lotes diferentes. A serialização global prioriza simplicidade neste teste e limita escalabilidade. O adaptador PGlite usa fila por instância.

`GET /api/cron/settle` autenticado liquida lotes vencidos. `vercel.json` solicita execução por minuto. Leituras de lotes/carteira e mutações também liquidam vencidos. Repetir a chamada não repete transferências. Lances fora da janela são recusados mesmo antes do cron. Lotes com auditoria inválida são bloqueados e retornados em `blocked` pelo cron.

A publicação usa o plano Pro da NatosTech, com cron de um minuto habilitado. As requisições reais do agendador foram conferidas nos logs da Vercel. Em outra instalação, confirmar o suporte do plano; liquidação no próximo acesso não substitui o cron.

</details>

## 🛡️ Auditoria e integração com o museu

<details>
<summary><strong>Auditoria e API externa — ver detalhes</strong></summary>

Cada lance contém HMAC-SHA256 dos seus dados e hash anterior. Checkpoint HMAC autentica metadados, estado, quantidade, último hash e comprovante. Detecta alteração/inserção/exclusão, inclusive da última linha. `AUDIT_SECRET` fica fora do banco. Não trocar a chave após criar lotes: invalida assinaturas existentes.

Limites: verificação confia no servidor/chave. Não protege contra quem controla a chave nem detecta restauração integral de snapshot antigo válido com seus checkpoints. Não é blockchain ou certificação independente; garantia contra rollback integral exigiria ancoragem externa.

Dados e JPEG da obra são copiados para PostgreSQL ao publicar. Vitrine, sala, auditoria e comprovante usam essa cópia. API indisponível afeta somente novas buscas/importações, com mensagem clara. Imagens são servidas por endpoint próprio com cache, fora do JSON de polling. Só imagens CC0 do host oficial do museu, limitadas a 3 MiB.

</details>

## ☁️ Publicar na Vercel

<details>
<summary><strong>Vercel — ver detalhes</strong></summary>

1. Criar PostgreSQL exclusivo, configurar `DATABASE_URL`, executar `npm run db:migrate` e depois `npm run db:setup`.
2. Importar **NonattoDev/arremata-ae** na conta autorizada, framework Next.js; `npm ci` e `npm run build`.
3. Configurar `DATABASE_URL`, `AUDIT_SECRET`, `CRON_SECRET`, `APP_URL=https://seu-dominio` como variáveis protegidas de produção. `DEMO_PASSWORD` só é necessária no setup.
4. Usar banco separado para preview, nunca produção em previews de código não confiável.
5. Confirmar READY, acesso público sem barreira Vercel e cron por minuto ativo. Vercel envia `Authorization: Bearer CRON_SECRET`.
6. Testar dois logins, lances concorrentes, reserva/liberação, encerramento sem navegador, comprovante e auditoria em desktop/mobile.
7. Enviar os links no formulário do teste com relato de IA. Submissão não automatizada.

</details>

## ✅ Como verificar

```sh
npm test
npm run typecheck
npm run build
```

Para quem instalou somente com Docker, execute as verificações dentro do serviço, com o usuário padrão `node` (sem root):

```sh
docker compose --env-file .env.docker exec app npm test
docker compose --env-file .env.docker exec app npm run typecheck
# Build em container descartável, sem alterar o app que está rodando:
docker compose --env-file .env.docker run --rm --no-deps app npm run build
# Smoke mutável: execute apenas na instalação local isolada de avaliação.
docker compose --env-file .env.docker exec -e SMOKE_BASE_URL=http://localhost:4168 app npx tsx scripts/smoke.ts
```

No smoke acima, `localhost:4168` é a porta **interna do container**, mesmo se `PORTA_APP` tiver outro valor no host. `DEMO_PASSWORD` já vem do `.env.docker`.

Testes de domínio executam SQL em PGlite e cobrem limites, papéis, saldo entre lotes, concorrência local, anti-sniping, liquidação, cancelamento, privacidade e adulteração direta no SQL. Um teste adicional percorre Prisma → pg → protocolo PostgreSQL → PGlite para comprovar persistência, rollback, liquidação e auditoria. A suíte de domínio também foi executada em uma branch isolada do Neon, usando conexões Prisma independentes nas disputas e na liquidação concorrente. Evidências/pendências em `docs/VALIDACAO.md`.

Para reproduzir no PostgreSQL, use uma **base descartável com a migration aplicada**, defina `POSTGRES_TEST_URL` e execute `npx tsx --test tests/auction.test.ts`. A suíte cria dados e adultera históricos deliberadamente: nunca usar a base publicada. Para smoke HTTP fora do Docker, defina obrigatoriamente `SMOKE_BASE_URL` com o destino isolado e `DEMO_PASSWORD` com a senha das contas sintéticas e execute `npx tsx scripts/smoke.ts`. O smoke verifica CPF/nascimento antes de criar dados; contas antigas incompletas devem ser completadas pela interface. Ele adiciona R$ 10 à carteira de Ana, cria um lote, testa disputa/reserva, cancela duas vezes para conferir estorno idempotente e preservação da auditoria. O lote de teste permanece cancelado, sem reserva pendente. Não execute esse smoke na produção.

<a id="organizacao-e-ia"></a>

## 🗂️ Organização e uso de IA

- `src/app`: rotas explícitas do App Router e composição de layout.
- `src/funcionalidades`: telas separadas por funcionalidade.
- `src/componentes`: componentes reutilizáveis, layout e provider de sessão.
- `src/hooks`, `src/lib`, `src/tipos`: polling, formatação/transporte e contratos.
- `src/servidor/actions`: entradas de mutação chamadas pela interface.
- `src/servidor/comandos`: validação/autorização compartilhada pelas Actions e HTTP.
- `src/servidor/leilao.ts`: operações transacionais de mercado; `dominio/auditoria.ts`: integridade HMAC.
- `src/servidor/banco`: adapters Prisma/PostgreSQL e PGlite.
- `src/servidor/seguranca.ts`: senhas/sessões/limites; `catalogo.ts`: API e imagens.
- `prisma/schema.prisma`: modelos e relações; `prisma/migrations`: SQL versionado.
- Interface com componentes e aparência nativa HeroUI. `globals.css` importa apenas Tailwind e HeroUI; utilitários de layout/responsividade e exceção autorizada de transparência, borda, sombra e blur na navbar glass. Obras usam `ImagemObra` com Next/Image.
- `docs/ARQUITETURA.md`: responsabilidades, limites e decisões.
- `docs/REQUISITOS.md`: rastreabilidade do PDF.
- `docs/CHECKLIST-DESAFIO.md`: checklist obrigatório/opcional com evidências e pendências de entrega.

O Codex teve participação ampla na estrutura, no código, nos testes, na documentação e na revisão. Robson definiu os fluxos, acompanhou o desenvolvimento, testou telas e solicitou correções nas regras e na interface. As verificações e seus limites estão registrados em [VALIDACAO.md](docs/VALIDACAO.md).

Fontes técnicas: [Cleveland Open Access API](https://www.clevelandart.org/open-access-api), [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [HeroUI 3](https://heroui.com/en/docs/react/getting-started/frameworks).
