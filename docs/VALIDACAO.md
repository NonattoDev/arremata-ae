# Evidências da primeira implementação — 22/10/2026

## Conferido localmente

- TypeScript sem erros.
- `npm run check` concluído: TypeScript, 10 testes e build de produção Next.js. `npm audit --omit=dev`: nenhuma vulnerabilidade reportada.
- 10 testes de integração SQL/PGlite passando: papéis, valores/horários, reserva/liberação, líder impedido de cobrir lance, disputas simultâneas, carteira entre lotes, anti-sniping, liquidação única, cancelamento, privacidade e adulteração (edição, exclusão intermediária/final e inserção).
- Regressão adicional: recebimento acima do limite de depósitos não bloqueia liquidação nem listagem.
- Importação real da API Cleveland Museum of Art com imagem persistida no banco.
- Smoke HTTP (`npx tsx --env-file=.env.local scripts/smoke.ts`, exige servidor local): login real, HttpOnly, bloqueio de origem externa, autorização por papel, depósito, criação por API, lances, posição após ser superado, auditoria pública sem e-mails e imagem própria.
- Navegador desktop: login de Ana, primeiro lance de R$ 100; sessão independente de Bruno, lance de R$ 110. Tela de Ana passou a “Você foi superado. Sua posição: 2º.” sem recarregar; reserva foi liberada.
- Lote curto do smoke HTTP encerrado pelo fluxo oportunista; comprovante público retornou HTTP 200 com valor de R$ 110 e alias do vencedor. Isso não comprova o agendador da Vercel.
- Inspeção visual da home desktop, sala e carteira em viewport 390 × 844. Sala sem overflow horizontal (scrollWidth 375 no viewport 390, incluindo scrollbar do navegador).
- Revisão independente encontrou três P2 (seleção antiga, resposta fora de ordem, teto de recebimentos). Corrigidos e relidos pelo revisor, sem novo achado nas correções.

As capturas locais ficam em `output/playwright/`, ignoradas pelo Git para não publicar estados de sessões de teste.

## Pendências registradas na primeira implementação (histórico)

- PostgreSQL hospedado: aplicar esquema/seed e testar transações concorrentes por conexões independentes. PGlite usa fila local e não exercita o advisory lock distribuído.
- Vercel: vincular GitHub pessoal, variáveis, deploy READY e URL pública acessível.
- Confirmar plano que permita cron por minuto; comprovar liquidação com navegador fechado e agendador real, inclusive reexecução idempotente.
- Repetir fluxo completo no deploy: cadastro, ambos os papéis, publicação/cancelamento, lances, carteira, auditoria e comprovante público.
- Revalidar API indisponível em produção e todos os tamanhos de tela relevantes.
- Revisão final do candidato, entendimento das decisões, preenchimento do relato de IA e submissão explícita do formulário.

Não interpretar “implementado” ou “teste local passou” como prova de funcionamento em produção ou de aprovação no processo seletivo.

## Refatoração de arquitetura — 22/10/2026

- Telas/componentes/hooks separados; rotas explícitas do App Router e sessão compartilhada. CSS dividido preservando todas as regras (comparação normalizada contra HEAD anterior).
- Mutações da UI via Server Actions; commands compartilhados com HTTP. Prisma 7 com schema, relações, migration inicial e adapter PostgreSQL transacional.
- prisma validate, typecheck, 12 testes e build aprovados. npm audit --omit=dev sem vulnerabilidades.
- Teste Prisma → pg → TCP → PGlite: persistência de lote/lance, rollback, liquidação repetida e auditoria intacta. Não é prova de concorrência PostgreSQL multi-instância.
- Navegador integrado: login Ana por Action; depósito simulado de R$1 (saldo 5010 → 5011); lance R$120 aceito, liderança e saldo disponível R$4891. Captura local em output/playwright/server-action-wallet.png (ignorada no Git).
- Revisão independente sem achados P1/P2 nas Actions, permissões, adapter e rotas/sessão.
- Vercel, PostgreSQL hospedado e cron sem navegador permanecem pendentes.

## Interface nativa HeroUI — 22/10/2026

- Removidos os 13 arquivos de CSS próprio; globals contém somente os imports de Tailwind/HeroUI. Componentes visuais, formulários, tabelas, textos e navegação usam HeroUI 3.
- Exceções aprovadas: Next/Image para obras, Tailwind somente para layout/espaçamento/dimensões/responsividade e html/body no layout raiz.
- Navegador integrado: logout/login do leiloeiro, depósito simulado de R$1 (saldo Ana 5011 → 5012), catálogo Monet, seleção de obra habilitando publicação e valores iniciais 100/10 preservados.
- Revisão independente identificou defaultValue no nível incorreto do TextField. Corrigido e revisado novamente sem novos achados P1/P2.
- TypeScript, 12 testes e build de produção passaram; npm audit após remoção de lucide-react reportou zero vulnerabilidades.
- A inspeção anterior em viewport móvel não comprova esta nova interface; repetir no ambiente final. Deploy Vercel e validação com PostgreSQL hospedado continuam pendentes.

## Publicação Vercel + Neon — 22/10/2026

- URL pública: https://arremata-ae.vercel.app. Vercel NatosTech/Pro; projeto arremata-ae ligado ao GitHub pessoal NonattoDev/arremata-ae, branch main, Node 24 e região iad1.
- PostgreSQL 17 exclusivo no Neon pessoal Robson Nonato, região aws-us-east-1. Migration Prisma inicial aplicada e seed com 1 leiloeiro, 2 licitantes, 2 lotes abertos e 1 agendado. Runtime usa pooler e validação SSL verify-full; variáveis são segredos de produção.
- 10 testes de domínio passaram em uma branch Neon isolada, incluindo duas conexões Prisma independentes para lances iguais, disputa da mesma carteira em lotes diferentes e liquidação concorrente; testes de adulteração não rodaram na base publicada.
- Smoke HTTP da URL pública: três logins reais, HttpOnly, papéis, origem inválida bloqueada, depósito, importação do museu, lances, posição após ser superado, auditoria anônima e imagem própria.
- Navegador integrado em produção: login Ana via Server Action e lance de R$100 aceito no lote 5d66d806-2e0d-4c5b-8ce9-8ad62dd33927; liderança, histórico e saldo disponível R$4910. Captura local output/playwright/production-bid.png.
- TypeScript, 12 testes locais e build passaram após tornar o smoke e a suíte PostgreSQL reproduzíveis por variáveis explícitas.
- Cron de um minuto habilitado; logs CDN identificam user agent vercel-cron/1.0 e resposta 200. Nenhum erro/fatal de runtime encontrado na janela inicial de 15 minutos.
- Encerramento autônomo comprovado: lote 6dfaddac-d711-4b5c-802e-1ba0fd3550b5 venceu às 22:45:41.361Z; o cron real das 22:46:28.283Z liquidou às 22:46:28.396Z. Durante a espera, navegador ficou na tela de login, sem polling de lotes/carteira; conferência foi SELECT direto, sem chamar serviços de liquidação.
- Banco confirmou closed, comprovante de R$110 e exatamente duas movimentações. Duas reexecuções autenticadas mantiveram duas movimentações; sem segredo, endpoint retornou 401. Auditoria e comprovante públicos responderam 200.

## Pendências atuais para submissão

- Repetir inspeção visual da versão HeroUI em viewport móvel e revisão final de todos os fluxos pelo candidato. A validação desktop/publicação acima não comprova revisão mobile completa.
- Revisar decisões e relato de uso de IA; enviar o formulário somente por solicitação explícita.
- A branch Neon validation-20261022 permanece isolada para inspeção, com suspensão após cinco minutos sem atividade; contém dados deliberadamente adulterados pelos testes e não está ligada à Vercel.

## Auditoria do checklist — 22/10/2026

- Releitura de todos os grupos obrigatórios no código, com rastreabilidade em CHECKLIST-DESAFIO.md.
- 13 testes passaram, Prisma schema válido, TypeScript e build aprovados.
- Novo teste simula indisponibilidade total de fetch: busca/importação falham com mensagem, mas lotes persistidos, sala, lance, auditoria, liquidação e comprovante continuam funcionando; imagem permanece armazenada.
- Teste de propriedade reforçado com segundo leiloeiro: não cancela nem lista o lote alheio.
- Smoke HTTP local: três logins, HttpOnly, origem, papéis, depósito, importação real, lances, posição, auditoria e imagem; lote 277d5c9f-18dd-4ab4-92b1-5013e6dfd2fa.
- Fluxo HTTP local adicional: cadastro de vendedor sintético, login, sessão, catálogo, publicação, cancelamento sem lances, ocultação na vitrine e logout. Lote 2b80341a-d782-4310-8084-2750b2757bf8.
- Painel exibe resultado do arremate e cópia do link do comprovante; botão conferido no navegador integrado.
- Navegador detectou parágrafos aninhados no total do painel. Corrigido também o wrapper redundante do contador da sala; recarga/navegação não geraram novos erros de aninhamento.
- Inspeção mobile da interface final ainda pendente; o navegador integrado disponível não expõe controle de viewport nesta sessão. Não usar inspeção desktop como prova de mobile.
