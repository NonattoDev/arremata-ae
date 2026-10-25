# Arremata aê

Casa de leilões demonstrativa para o desafio **Elite Dev Verzel**. Obras vêm da API pública do Cleveland Museum of Art e usuários disputam lotes com saldo simulado. Não há dinheiro real nem venda das obras do museu.

## Estado

Publicado em **https://arremata-ae.vercel.app** na Vercel (NatosTech), com PostgreSQL 17 no Neon pessoal de Robson Nonato. Repositório público pessoal: **NonattoDev/arremata-ae**. Evidências e limites de validação estão em `docs/VALIDACAO.md`; revisão do candidato e submissão do teste continuam manuais.

## Stack

Next.js 16 App Router, React 19, TypeScript, HeroUI 3 e Tailwind CSS 4. Back-end Node.js com Server Actions para mutações e Route Handlers para consultas/polling e compatibilidade HTTP. PostgreSQL via Prisma 7 e adapter `pg` em produção; PGlite (PostgreSQL WASM) para desenvolvimento/testes locais. Autenticação com scrypt, sessões opacas armazenadas por hash e cookies HttpOnly/SameSite, Secure em produção. Zod valida entradas; escritas verificam origem e tentativas são limitadas no banco.

## Executar

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

### Contas de demonstração

| Papel     | E-mail                    | Saldo inicial |
| --------- | ------------------------- | ------------- |
| Leiloeiro | `leiloeiro@arremata.test` | R$ 0          |
| Licitante | `ana@arremata.test`       | R$ 5.000      |
| Licitante | `bruno@arremata.test`     | R$ 5.000      |

Na demonstração publicada, a senha das três contas é `Arremata-Demo-2026!` (contas sintéticas, sem dinheiro real). Em instalações próprias, a senha é `DEMO_PASSWORD` do primeiro setup. Reexecutar não redefine senhas nem repõe saldo existente. Informe a senha de demonstração ao avaliador junto à URL; não utilize credenciais pessoais.

O seed importa três obras reais: duas abertas e uma agendada. Não duplica lotes se já houver lote aberto. Se todos expiraram, cria novo conjunto com datas relativas à execução. A primeira importação depende da API; lotes existentes não dependem dela.

### PostgreSQL convencional

Defina `DATABASE_URL`, execute `npm run db:migrate` e depois `npm run db:setup` (seed). O modelo está em `prisma/schema.prisma`, e as migrations versionadas em `prisma/migrations`. `npm ci` gera o cliente Prisma; `npm run db:generate` regenera após mudanças. Em desenvolvimento PostgreSQL, use `npm run db:migrate:dev` para criar novas migrations. O seed não cria tabelas em PostgreSQL remoto. Use base exclusiva e usuário com permissão para criar tabelas/índices. Configure SSL na URL conforme o provedor, sem desabilitar validação de certificado.

## Regras implementadas

- Vitrine: ao vivo, agendados e encerrados; cancelados ocultos; busca por obra/artista.
- Leiloeiro busca API pública, publica lotes com início/fim, lance inicial/incremento e gerencia somente os próprios lotes. Não pode dar lances.
- Cancelamento básico somente sem lances e antes de encerrar.
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

## Concorrência e encerramento

Operações de mercado usam transação PostgreSQL com `pg_advisory_xact_lock(215884)`, compartilhada entre instâncias Node.js. Isso protege também a mesma carteira em lotes diferentes. A serialização global prioriza simplicidade neste teste e limita escalabilidade. O adaptador PGlite usa fila por instância.

`GET /api/cron/settle` autenticado liquida lotes vencidos. `vercel.json` solicita execução por minuto. Leituras de lotes/carteira e mutações também liquidam vencidos. Repetir a chamada não repete transferências. Lances fora da janela são recusados mesmo antes do cron. Lotes com auditoria inválida são bloqueados e retornados em `blocked` pelo cron.

A publicação usa o plano Pro da NatosTech, com cron de um minuto habilitado. As requisições reais do agendador foram conferidas nos logs da Vercel. Em outra instalação, confirmar o suporte do plano; liquidação no próximo acesso não substitui o cron.

## Auditoria e API externa

Cada lance contém HMAC-SHA256 dos seus dados e hash anterior. Checkpoint HMAC autentica metadados, estado, quantidade, último hash e comprovante. Detecta alteração/inserção/exclusão, inclusive da última linha. `AUDIT_SECRET` fica fora do banco. Não trocar a chave após criar lotes: invalida assinaturas existentes.

Limites: verificação confia no servidor/chave. Não protege contra quem controla a chave nem detecta restauração integral de snapshot antigo válido com seus checkpoints. Não é blockchain ou certificação independente; garantia contra rollback integral exigiria ancoragem externa.

Dados e JPEG da obra são copiados para PostgreSQL ao publicar. Vitrine, sala, auditoria e comprovante usam essa cópia. API indisponível afeta somente novas buscas/importações, com mensagem clara. Imagens são servidas por endpoint próprio com cache, fora do JSON de polling. Só imagens CC0 do host oficial do museu, limitadas a 3 MiB.

## Vercel

1. Criar PostgreSQL exclusivo, configurar `DATABASE_URL`, executar `npm run db:migrate` e depois `npm run db:setup`.
2. Importar **NonattoDev/arremata-ae** na conta autorizada, framework Next.js; `npm ci` e `npm run build`.
3. Configurar `DATABASE_URL`, `AUDIT_SECRET`, `CRON_SECRET`, `APP_URL=https://seu-dominio` como variáveis protegidas de produção. `DEMO_PASSWORD` só é necessária no setup.
4. Usar banco separado para preview, nunca produção em previews de código não confiável.
5. Confirmar READY, acesso público sem barreira Vercel e cron por minuto ativo. Vercel envia `Authorization: Bearer CRON_SECRET`.
6. Testar dois logins, lances concorrentes, reserva/liberação, encerramento sem navegador, comprovante e auditoria em desktop/mobile.
7. Enviar os links no formulário do teste com relato de IA. Submissão não automatizada.

## Verificações

```sh
npm test
npm run typecheck
npm run build
```

Testes de domínio executam SQL em PGlite e cobrem limites, papéis, saldo entre lotes, concorrência local, anti-sniping, liquidação, cancelamento, privacidade e adulteração direta no SQL. Um teste adicional percorre Prisma → pg → protocolo PostgreSQL → PGlite para comprovar persistência, rollback, liquidação e auditoria. A suíte de domínio também foi executada em uma branch isolada do Neon, usando conexões Prisma independentes nas disputas e na liquidação concorrente. Evidências/pendências em `docs/VALIDACAO.md`.

Para reproduzir no PostgreSQL, use uma **base descartável com a migration aplicada**, defina `POSTGRES_TEST_URL` e execute `npx tsx --test tests/auction.test.ts`. A suíte cria dados e adultera históricos deliberadamente: nunca usar a base publicada. Para smoke HTTP, `SMOKE_BASE_URL` seleciona explicitamente o destino e `DEMO_PASSWORD` autentica as contas sintéticas: `npx tsx scripts/smoke.ts`. Esse smoke cria um lote e movimenta saldo simulado.

## Organização e uso de IA

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

Desenvolvido com assistência do Codex para estrutura, código, testes, documentação e revisão. Foram conferidas regras contra o PDF, executadas verificações e corrigidos achados de revisão. Não se afirma revisão manual do candidato ainda não realizada: antes de enviar, Robson deve revisar/compreender a solução e ajustar o relato à participação real.

Fontes técnicas: [Cleveland Open Access API](https://www.clevelandart.org/open-access-api), [Next.js Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [HeroUI 3](https://heroui.com/en/docs/react/getting-started/frameworks).
