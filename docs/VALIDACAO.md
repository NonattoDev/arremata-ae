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

## Pendências para entrega final

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
