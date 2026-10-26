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

### Publicação da revisão auditada

Commit 8b425bf publicado no GitHub pessoal e deploy Vercel dpl_D7byTETGeiRUuF6LXER15bosWMUV confirmado READY. Smoke HTTP autenticado público aprovado: três logins, autorização, depósito simulado, API real, lances, posição, auditoria e imagem. Lote do smoke: 2d86dc11-98c7-4c20-a1e2-8c8896942463. Comprovante de lote encerrado conferido sem login no navegador, com alias e R$110. Há lote aberto até 05/11/2026. Essas verificações não substituem a revisão móvel nem a revisão pessoal do candidato.

## Refatoração PT-BR, SWR e Day.js — validação local em 22/10/2026

- Componentes, funcionalidades, serviços, ações e modelos Prisma passaram a usar nomes em português. Contratos externos, colunas físicas e conteúdo assinado foram preservados.
- `npm run check`: TypeScript, 16 testes e build aprovados. `npm run db:validate`: schema válido. Não houve reset nem migração física do banco.
- Smoke HTTP local aprovado: login, cookie HttpOnly, CSRF, papéis, depósito, importação, lances, posição, auditoria e imagem persistida. Lote criado: `a08f8fcc-c562-4855-9482-f19f61986a98`.
- No navegador integrado: saída do leiloeiro, entrada como Ana, carteira e depósito simulado de R$ 1 pela Server Action com atualização do saldo; saída e entrada como Bruno com carteira distinta. Consultas usam SWR com escopo por usuário.
- Histórico anterior à refatoração `0aa7da8c-0b36-45bb-afc6-a2f96caa17a4` continuou exibindo “Histórico íntegro”.
- Transição de página usa Web Animations em Card HeroUI e respeita movimento reduzido por implementação. Não houve validação manual da preferência do sistema nem nova revisão mobile nesta rodada.
- Esta rodada está no código local; as evidências de produção anteriores não comprovam publicação desta refatoração.

## Fontes e Motion — validação local em 22/10/2026

- Motion instalado; Manrope e Sora configuradas em next/font.
- npm run check: TypeScript, 16 testes e build aprovados.
- Navegador integrado confirmou fontes carregadas: Manrope no corpo, Sora no título e marca.
- Foco por teclado acionou o símbolo; transformação intermediária observada, confirmando movimento real. Preferência de movimento reduzido tratada no hook, sem alteração da configuração do sistema nesta validação.
- Alteração local, sem publicação nesta rodada.

## Fechamento visual e revisão responsiva — 24/10/2026, local

- Navegador integrado, com viewport explícito: 360×800, 390×844, 768×1024 e 1366×900. Não é teste em aparelho físico ou Safari/iOS.
- Navbar mobile em uma linha, menu com navegação por perfil, tema e saída. Início e catálogo mantêm margens; obras preservam proporção. Fontes Manrope/Sora e animação da marca mantidas.
- Sala separa área de disputa dos dados da obra, com preço destacado. Carteira separa total, comprometido e disponível. Formulários recebem espaçamento consistente; resultados da API têm área de rolagem e confirmação da obra selecionada.
- Auditoria quebra checkpoint longo. Histórico tem rolagem horizontal e foco por teclado: em 360 px, largura visível 273 px, conteúdo 386 px e scrollLeft avançou com ArrowRight. Não houve aumento da largura do documento nas medições da sala, carteira, comprovante, auditoria e início.
- Cadastro sintético de licitante pela interface concluído; login do leiloeiro e de Ana, logout e menus por perfil conferidos. Sessão inicial de Bruno participou da disputa.
- Carteira: depósito de R$1, total de R$4670 para R$4671. Lance de Bruno de R$130 atualizou histórico, liderança e disponível para R$4541; Ana viu posição 2, deu R$140 e passou à posição 1, com disponível de R$4903. Valores locais de teste.
- Leiloeiro buscou Monet na API, selecionou Spring Flowers e publicou lote agendado 02e601c8-0095-4008-8ba8-64d92074c940. Painel exibiu o lote e cancelamento sem lances funcionou. Ajustado texto do prazo cancelado para não apresentar data futura como encerramento já ocorrido.
- Comprovante a08f8fcc-c562-4855-9482-f19f61986a98 aberto sem login; cópia retornou o endereço correto. Auditoria pública exibiu histórico íntegro e aliases, sem e-mails/nome dos licitantes.
- Tema claro/escuro exercitado no menu; comprovante e auditoria inspecionados em tema escuro.
- npm run check: 16 testes, TypeScript e build aprovados; npm run db:validate: schema válido. Após ajustes finais de tabela, prazo cancelado e imagem de destaque, TypeScript e build reexecutados com sucesso.
- Smoke HTTP local aprovado: três logins, HttpOnly, CSRF, papéis, depósito, importação, regras de lance, posição após ser superado, auditoria pública e imagem persistida. Lote 8664e170-43dd-4b59-a634-0e850ec34281.
- Capturas locais: .local/revisao-desktop-24out.png e .local/revisao-mobile-24out.png. Dados e capturas de avaliação não integram o deploy.
- Revisão ainda local: não houve commit, push, deploy ou submissão do formulário nesta rodada. Vercel/Neon não foram alterados. A revisão pessoal do candidato permanece pendente.

## Mural, ícones e acompanhamento — 24/10/2026, local

- Google Material Symbols Rounded hospedados no projeto (subconjunto TTF de 10.704 bytes e licença Apache 2.0). Ícones reutilizáveis em navegação, saída, tema, autenticação, carteira, lotes, auditoria e comprovantes. Marca com Bricolage Grotesque.
- Indicador ao vivo com pulso suave; preferência de movimento reduzido desativa a animação. Sala reorganizada em galeria, disputa e histórico; formulário de lance separado em componente.
- Mural HeroUI abre ao clicar nas obras no início, catálogo e sala. Obra completa e três recortes identificados da mesma reprodução; não são fotografias adicionais. Seleção do detalhe central e fechamento conferidos no navegador, incluindo 390×844.
- Miniplayer global: até cinco IDs de lotes, seleção e estado recolhido persistidos neste navegador por conta. Preços, posição e prazo vêm do servidor via SWR; valores financeiros não são persistidos no localStorage. Falha de atualização exibe aviso de dados da última consulta. Não há sincronização da seleção entre dispositivos.
- Navegação início → carteira → sala e recarga mantiveram dois lotes; terceiro incluído na sala. Recolher/expandir preservou seleção. Lance local de Ana de R$300 no Red Kerchief atualizou histórico, liderança e painel, disponível de R$4903 para R$4603.
- Limite de cinco, duplicatas, substituição após remoção e armazenamento inválido cobertos por testes automatizados. Interface exercitada com três lotes ativos, não com cinco.
- Revisão em 360×800, 390×844 e 1366×900. Em 360 px, documento com 345 px, sem rolagem horizontal; menu compacto mantém navbar em uma linha. Modal e painel com rolagem própria. Console da inspeção final sem erros.
- npm run check: TypeScript, 18 testes e build aprovados. Ajustes posteriores limitados ao plural de lances e menu compacto; TypeScript revalidado.
- Evidências locais: .local/sala-miniplayer-24out.png e .local/miniplayer-mobile-24out.png. Sem commit, push, deploy ou submissão nesta rodada.

## Cadastro, login e logout mobile — 24/10/2026

- Fluxo real pela interface local no navegador integrado: cadastro de licitante sintético Teste Mobile Completo, logout, tentativa de acesso a /meus-lotes (redirecionou para /entrar), login com senha incorreta (recusado), login correto, acesso à área privada e segundo logout.
- Viewports: cadastro 390×844; login e área privada 360×800. Não é teste em aparelho físico. Área privada com largura do documento igual a 360 px, sem rolagem horizontal.
- Sugestões após @: cinco domínios; clique em Gmail completou endereço, prefixo ic filtrou iCloud, Escape ocultou sugestões. No login, out filtrou Outlook e clique completou. Cadastro efetivo usou domínio example.com para não associar o teste a uma caixa real.
- Regras e confirmação ocultas antes da digitação. Senha curta exibiu regra não atendida. Confirmação diferente bloqueou o cadastro; confirmação igual permitiu criação. Olhos mudaram password/text independentemente no cadastro, e nos dois sentidos no login; o cadastro e login posteriores confirmaram preservação dos valores.
- Console da área privada sem erros na inspeção; npm run check aprovado: 19 testes, TypeScript e build.
- Evidência: .local/fluxo-mobile-autenticado-24out.png. Conta sintética permanece no banco local; sessão encerrada ao final. Nenhum deploy ou dado de produção alterado.

## Revalidação dos obrigatórios — 25/10/2026

- npm run check aprovado: TypeScript, 26 testes e build de produção. npm run db:validate aprovado.
- Smoke HTTP local aprovado com as três contas sintéticas: login/HttpOnly, origem inválida, papéis, depósito, importação pública, persistência de imagem, mínimos de lance, liderança, superação/posição e auditoria sem e-mails. Lote criado: da8de430-67bb-43b8-97f5-a578a787adce. O teste adicionou R$ 10 simulados à Ana e criou dois lances nesse lote exclusivo de validação.
- Navegador integrado em 393×852: sala autenticada como Ana, segundo lugar após lance de Bruno, contador com segundos e saldo disponível. Não é teste em aparelho físico.
- Perfil adicional (não exigido pelo PDF): nome/CPF gravados juntos; CPF inválido não grava nome; documento existente não pode ser sobrescrito. Foto/avatares, troca de senha e isolamento entre usuários cobertos por testes.
- Consulta da Vercel: projeto arremata-ae em NatosTech, produção READY dpl_BJESYKQNJb7jDz5zN9B31WaoFDwp, commit d15ac481. Catálogo público respondeu HTTP 200 com três lotes ao vivo. Isso confirma a versão antiga, não a revisão local.
- Prisma migrate status no Neon confirmou duas migrations pendentes: avatar_usuario e cpf_usuario. Ambas apenas acrescentam colunas opcionais; não removem registros nem alteram o segredo da auditoria.

### Publicação da revisão de 25/10

- Migrations 20261025000000_avatar_usuario e 20261025010000_cpf_usuario aplicadas com Prisma Migrate Deploy no Neon existente. Nenhum reset/seed de produção nem alteração do segredo HMAC.
- GitHub pessoal main atualizado; código da revisão 06e46b9 e assets dos avatares f8062eb. Vercel NatosTech: deploy dpl_Bty5EWQqr4VoDSQ3tXPgegvH4eLE READY, URL pública arremata-ae.vercel.app.
- Smoke HTTP na URL pública aprovado para três contas e regras básicas. Criou lote 05948dbf-6b2f-4b86-8bf7-50c987e95dff, dois lances e depósito simulado de R$ 10 na conta Ana. Não alterou lances dos lotes anteriores.
- Login real de Ana na interface publicada e gravação do perfil pela Server Action aprovados em viewport 393×852. Nome mantido, CPF não preenchido. Imagem/categorias de avatares exibidas. Evidências locais: .local/producao-perfil-mobile-25out.png e .local/producao-avatares-mobile-25out.png.
- Lote local de smoke encerrou, gerou comprovante de R$ 110 e auditoria íntegra. Encerramento publicado é verificado separadamente.

- Comprovante do lote público de smoke retornou HTTP 200, R$ 110, auditoria íntegra com dois lances, sem e-mail de licitante; repetição preservou o mesmo comprovante. A aplicação também liquida vencidos nas leituras: esta observação comprova encerramento via aplicação, não isola a execução do agendador.
- Configuração ativa de cron conferida pela API da Vercel: habilitado, associado ao deploy f8062eb, rota /api/cron/settle a cada minuto. Consulta ao conector de logs não retornou eventos nesta janela; a evidência de execução real anterior de 22/10 permanece histórica.
- Revisão pessoal e envio do formulário continuam pendentes. Não houve envio automático do desafio.


## 26/10/2026 — cancelamento com estorno e Docker Compose

- Cancelamento pelo dono do lote, inclusive com lances, com confirmação HeroUI no painel. Libera a reserva sem criar crédito: o valor ainda não havia sido debitado. Histórico e checkpoint continuam íntegros. Lotes encerrados não podem ser cancelados.
- `npm test`: 34 testes passaram, zero falhas. O novo teste de cancelamento verifica liberação da reserva, preservação da reserva de outro lote, ausência de crédito ao vendedor, repetição idempotente, lance concorrente, recusa após encerramento e auditoria preservada.
- `npm run typecheck`: aprovado.
- `npm run build -- --webpack`: aprovado em cópia isolada, sem arquivos `.env` e sem interromper o servidor local. Não equivale à execução da imagem Linux.
- Compose inclui PostgreSQL 17 com volume persistente e healthcheck, preparação com migrations e seed, aplicação e processo de liquidação a cada minuto. README inclui instalação do zero, contas de avaliação, porta alternativa, logs e preservação dos dados.
- A validação inicial acima precedeu a instalação do Docker. A execução real foi concluída na rodada descrita abaixo; a interface de confirmação de cancelamento não foi exercitada por cliques nessa rodada inicial.

## 26/10/2026 — execução do README com Docker

- Docker Desktop com backend WSL2: build Linux concluído em cópia isolada do código, sem `.env` nem banco do desenvolvimento. Porta alternativa 4169, mantendo a aplicação original na 4168.
- `docker compose --env-file .env.docker up --build -d`: PostgreSQL 17 criado em volume novo, migrations aplicadas e seed de três usuários e três lotes. Preparação terminou com código 0; aplicação e banco saudáveis, processo de liquidação iniciado.
- Build de produção Next.js com webpack e TypeScript aprovado dentro da imagem Linux.
- `docker compose --env-file .env.docker exec -T app npm test`: 34 testes aprovados, zero falhas. Os testes mantêm seus próprios adapters/bancos de teste; isso não equivale a 34 testes de integração no PostgreSQL do Compose.
- Por cliques no navegador: login de Ana com a conta do README, saldo inicial de R$ 5.000, depósito Pix simulado de R$ 100, confirmação, saldo de R$ 5.100 e comprovante.
- `down` sem `-v`, seguido de `up -d`: sessão, saldo de R$ 5.100 e comprovante preservados, sem duplicar crédito nem reinicializar o saldo.
- O worker registrou execução sem lotes vencidos. Esta rodada comprova sua inicialização, não uma liquidação real pelo agendador. O banco original e o ambiente publicado não foram alterados por este teste.
