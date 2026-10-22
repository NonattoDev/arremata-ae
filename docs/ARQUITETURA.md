# Arquitetura do Arremata aê

## Caminho de uma operação

`Tela → runAction → Server Action → comando validado/autorizado → serviço transacional → Prisma → PostgreSQL`

As Actions recebem entradas não confiáveis (`unknown`). Os comandos validam com Zod e derivam a identidade da sessão HttpOnly, nunca do corpo enviado pelo navegador. O serviço verifica novamente papel, propriedade, saldo e integridade dentro da transação. Retornos de Actions são discriminados (`success/data` ou `success/error`); erros internos não são enviados ao cliente.

## Responsabilidades

| Pasta                  | Responsabilidade                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `app`                  | Rotas reais do Next.js, parâmetros e composição. Sem roteador manual por pathname. |
| `features`             | Telas e formulários de cada funcionalidade.                                        |
| `components/ui`        | Field, Notice, Loading, Empty e Share reutilizáveis.                               |
| `components/auctions`  | Card de lote, countdown e histórico de lances.                                     |
| `components/layout`    | Navegação, tema e estrutura comum.                                                 |
| `components/providers` | Uma sessão compartilhada pelas telas.                                              |
| `hooks`                | Leitura/polling com descarte de respostas antigas.                                 |
| `lib` e `types`        | Formatação, contrato de Action e DTOs da interface.                                |
| `server/actions`       | Integração com cookies/headers do Next e comandos.                                 |
| `server/commands`      | Entrada validada, sessão e limites comuns a Actions/HTTP.                          |
| `server/domain`        | Tipos de domínio e integridade de histórico/checkpoint.                            |
| `server/auction.ts`    | Coordenação das operações atômicas de mercado.                                     |
| `server/database`      | Transações e acesso ao banco por adapter.                                          |
| `prisma`               | Schema, relações, índices e migrations versionadas.                                |
| `app/globals.css`      | Somente imports de Tailwind e HeroUI; nenhum CSS próprio.                          |

Componentes não conhecem SQL, cookies ou segredos. O domínio não conhece JSX nem APIs do Next. Não criar um arquivo genérico para acumular telas ou helpers sem relação. Ao adicionar funcionalidade, manter arquivos focados e extrair responsabilidades antes de aumentar a complexidade; quantidade de linhas é um sinal, não um motivo para fragmentação artificial.

## Server Actions e consultas

Login/cadastro/logout, depósito, criação/cancelamento e lance usam Actions de verdade importadas pela interface. `runAction` as invoca em uma transição React. O Next protege origem e tamanho do corpo; autorização e validação da aplicação continuam obrigatórias. Após sucesso, a tela atualiza seus recursos de leitura.

Consultas e polling usam GET, adequado à atualização a cada dois segundos. Imagens, comprovantes, auditoria e cron continuam acessíveis por HTTP. Os POSTs da API permanecem para compatibilidade/testes e delegam aos mesmos comandos: nenhuma regra de mutação é duplicada.

## Prisma e transações

Seis modelos: User, Session, Lot, Bid, LedgerEntry e RateLimit. Relações e nomes de colunas são mapeados para preservar o banco existente. Dinheiro é BigInt em centavos; datas usam timestamptz; snapshots/comprovantes usam JSONB. CHECKs de saldo, papel, estado, valores e datas ficam no SQL da migration, pois não são representados diretamente pelo Prisma Schema.

O runtime PostgreSQL usa PrismaClient com PrismaPg e transações interativas. As operações de mercado mantêm SQL parametrizado no serviço, executado pelo adapter Prisma. Esta etapa não converteu todas as consultas para `prisma.model.*`: preserva explicitamente o SQL das reservas, agregações e auditoria já testadas. Nunca interpolar entrada do usuário em SQL. Não considerar o uso de raw SQL equivalente à tipagem gerada dos modelos.

`pg_advisory_xact_lock(215884)` protege reserva de saldo entre lotes/instâncias. A transação inclui verificação, lance, atualização e checkpoint. Liquidação inclui débito, crédito, ledger e comprovante. Lock global limita escala, aceitável para este teste; mudar para locks granulares exige nova prova de concorrência.

## Desenvolvimento e migração

`npm ci` gera cliente ignorado pelo Git. `db:validate` valida schema; `db:migrate` aplica migrations; `db:migrate:dev` cria novas migrations em banco de desenvolvimento. Seed remoto exige migration aplicada e não altera DDL. PGlite local/testes lê o SQL da mesma migration inicial; migrations futuras precisam entrar no bootstrap local também.

A migration inicial é idempotente para incorporar a base desta primeira versão. Não usar `db push` ou reset para publicar. Preservar AUDIT_SECRET e dados ao migrar; trocar segredo invalida lotes existentes.

## Verificação e limites

Testes de domínio preservam as regras do PDF. O teste do adapter exercita Prisma/pg através de conexão TCP contra PGlite, com rollback e liquidação idempotente. Isso valida integração de tipos/protocolo/transações, mas não reproduz concorrência multi-instância de PostgreSQL hospedado. Essa prova foi executada em branch isolada Neon com conexões independentes; a aplicação está publicada na Vercel. Consulte as evidências e os limites em `VALIDACAO.md`.

## Interface HeroUI

Todos os controles, textos, tabelas, avisos e estruturas visuais usam HeroUI 3, com sua aparência nativa. As únicas exceções autorizadas são Next/Image para obras, utilitários Tailwind para layout, espaçamento, dimensões e responsividade, e html/body no layout raiz do Next.js. Não adicionar CSS próprio, estilos inline ou outra biblioteca de componentes. Field centraliza o contrato TextField/Input: value e defaultValue pertencem ao TextField. RouterProvider integra links HeroUI ao App Router; I18nProvider define pt-BR.
