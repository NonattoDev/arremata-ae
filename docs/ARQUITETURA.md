# Arquitetura do Arremata aê

## Caminho de uma operação

`Tela → executarAcao → Server Action → comando validado/autorizado → serviço transacional → Prisma → PostgreSQL`

As Actions recebem entradas não confiáveis (`unknown`). Os comandos validam com Zod e derivam a identidade da sessão HttpOnly, nunca do corpo enviado pelo navegador. O serviço verifica novamente papel, propriedade, saldo e integridade dentro da transação. Retornos de Actions são discriminados (`success/data` ou `success/error`); erros internos não são enviados ao cliente.

## Responsabilidades

| Pasta                    | Responsabilidade                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `app`                    | Rotas reais do Next.js, parâmetros e composição. Sem roteador manual por pathname. |
| `funcionalidades`        | Telas e formulários de cada funcionalidade.                                        |
| `componentes/ui`         | Campo, Aviso, Carregando, EstadoVazio e Compartilhar reutilizáveis.                |
| `componentes/leiloes`    | Card de lote, countdown e histórico de lances.                                     |
| `componentes/layout`     | Navegação, tema e estrutura comum.                                                 |
| `componentes/provedores` | Uma sessão compartilhada pelas telas.                                              |
| `hooks`                  | Leitura/polling com descarte de respostas antigas.                                 |
| `lib` e `tipos`          | Formatação, contrato de Action e DTOs da interface.                                |
| `servidor/actions`       | Integração com cookies/headers do Next e comandos.                                 |
| `servidor/comandos`      | Entrada validada, sessão e limites comuns a Actions/HTTP.                          |
| `servidor/dominio`       | Tipos de domínio e integridade de histórico/checkpoint.                            |
| `servidor/leilao.ts`     | Coordenação das operações atômicas de mercado.                                     |
| `servidor/banco`         | Transações e acesso ao banco por adapter.                                          |
| `prisma`                 | Schema, relações, índices e migrations versionadas.                                |
| `app/globals.css`        | Somente imports de Tailwind e HeroUI; nenhum CSS próprio.                          |

Componentes não conhecem SQL, cookies ou segredos. O domínio não conhece JSX nem APIs do Next. Não criar um arquivo genérico para acumular telas ou helpers sem relação. Ao adicionar funcionalidade, manter arquivos focados e extrair responsabilidades antes de aumentar a complexidade; quantidade de linhas é um sinal, não um motivo para fragmentação artificial.

## Server Actions e consultas

Login/cadastro/logout, depósito, criação/cancelamento e lance usam Actions de verdade importadas pela interface. `executarAcao` as invoca em uma transição React. O Next protege origem e tamanho do corpo; autorização e validação da aplicação continuam obrigatórias. Após sucesso, a tela atualiza seus recursos de leitura.

Consultas e polling usam GET, adequado à atualização a cada dois segundos. Imagens, comprovantes, auditoria e cron continuam acessíveis por HTTP. Os POSTs da API permanecem para compatibilidade/testes e delegam aos mesmos comandos: nenhuma regra de mutação é duplicada.

## Prisma e transações

Oito modelos: Usuario, Sessao, Lote, Lance, Movimentacao, LimiteTentativas, DepositoSimulado e PreferenciaNovidades. A revisão completa está em REVISAO-SCHEMA.md. Relações e nomes de colunas são mapeados para preservar o banco existente. Dinheiro é BigInt em centavos; datas usam timestamptz; snapshots/comprovantes usam JSONB. CHECKs de saldo, papel, estado, valores e datas ficam no SQL da migration, pois não são representados diretamente pelo Prisma Schema.

O runtime PostgreSQL usa PrismaClient com PrismaPg e transações interativas. As operações de mercado mantêm SQL parametrizado no serviço, executado pelo adapter Prisma. Esta etapa não converteu todas as consultas para `prisma.model.*`: preserva explicitamente o SQL das reservas, agregações e auditoria já testadas. Nunca interpolar entrada do usuário em SQL. Não considerar o uso de raw SQL equivalente à tipagem gerada dos modelos.

`pg_advisory_xact_lock(215884)` protege reserva de saldo entre lotes/instâncias. A transação inclui verificação, lance, atualização e checkpoint. Liquidação inclui débito, crédito, ledger e comprovante. Lock global limita escala, aceitável para este teste; mudar para locks granulares exige nova prova de concorrência.

## Desenvolvimento e migração

`npm ci` gera cliente ignorado pelo Git. `db:validate` valida schema; `db:migrate` aplica migrations; `db:migrate:dev` cria novas migrations em banco de desenvolvimento. Seed remoto exige migration aplicada e não altera DDL. PGlite local/testes executa a lista ordenada das migrations em servidor/esquema.ts; novas migrations devem entrar nesse bootstrap também.

A migration inicial é idempotente para incorporar a base desta primeira versão. Não usar `db push` ou reset para publicar. Preservar AUDIT_SECRET e dados ao migrar; trocar segredo invalida lotes existentes.

## Verificação e limites

Testes de domínio preservam as regras do PDF. O teste do adapter exercita Prisma/pg através de conexão TCP contra PGlite, com rollback e liquidação idempotente. Isso valida integração de tipos/protocolo/transações, mas não reproduz concorrência multi-instância de PostgreSQL hospedado. Essa prova foi executada em branch isolada Neon com conexões independentes; a aplicação está publicada na Vercel. Consulte as evidências e os limites em `VALIDACAO.md`.

## Interface HeroUI

Todos os controles, textos, tabelas, avisos e estruturas visuais usam HeroUI 3, com sua aparência nativa. As únicas exceções autorizadas são Next/Image para obras, utilitários Tailwind para layout, espaçamento, dimensões e responsividade, e html/body no layout raiz do Next.js. Não adicionar CSS próprio, estilos inline ou outra biblioteca de componentes. Field centraliza o contrato TextField/Input: value e defaultValue pertencem ao TextField. RouterProvider integra links HeroUI ao App Router; I18nProvider define pt-BR.

## Navegação

- `/`: início com lotes ao vivo e atalhos conforme o perfil.
- `/leiloes`: catálogo completo, busca e filtros de status.
- `/lotes/[id]`: sala do lote; `/auditoria/[id]` e `/comprovante/[id]` continuam públicos.
- `/entrar` e `/cadastro`: páginas separadas, com formulário reutilizável e Server Actions compartilhadas.
- `/meus-lotes`, `/carteira` e `/novo-lote`: áreas existentes preservadas, com acesso conforme sessão/papel.

Marca, CaminhoPagina e EstruturaAplicacao compõem o cabeçalho e a navegação comum. Breadcrumbs orientam páginas internas sem substituir o roteamento por arquivos do Next.js. A marca usa Next/Image como imagem de identidade solicitada pelo proprietário; o restante mantém HeroUI e utilitários somente de layout.

A navbar fica em BarraNavegacao, separada do conteúdo, com margens laterais e posição sticky. O pedido de glass autoriza nela utilitários Tailwind de transparência, borda, sombra e backdrop blur, preservando as cores do tema HeroUI. globals.css continua apenas com imports.

## Convenções em português, consultas e datas

Código próprio usa nomes em português, com comentários sobre decisões e regras. Nomes exigidos pelo Next.js/React e APIs das bibliotecas continuam nos contratos originais. Campos físicos do banco e chaves HTTP/JSON assinadas são preservados; traduzir esses valores invalidaria históricos HMAC. O schema Prisma usa modelos e campos em português com @map/@@map, sem alteração física do banco.

useRecurso usa SWR: consultas periódicas a cada dois segundos, revalidação ao focar e cache separado por usuário. Mutações continuam em Server Actions e revalidam as leituras após sucesso. Day.js centraliza apresentação pt-BR e conversão das datas dos formulários; a serialização dos registros assinados permanece estável.

TransicaoPagina anima o Card HeroUI na troca de rota com Web Animations, por 180 ms, e respeita prefers-reduced-motion. Não adiciona CSS próprio nem outra biblioteca visual.

## Tipografia e animação da marca

Por solicitação do proprietário, a interface usa DM Sans para textos e títulos, Instrument Serif para destaques de arte e tipografia da marca definida no componente Marca, carregadas por next/font. Esta é uma exceção autorizada à aparência tipográfica nativa; globals.css continua apenas com imports. Motion foi instalado para animar o símbolo existente na entrada, no hover e no foco, sem adicionar elementos HTML ou biblioteca de controles. O hook useAnimacaoMarca centraliza o gesto e respeita movimento reduzido. A animação não fica repetindo durante os leilões.

## Perfil

Configurações separam dados, imagem e senha. Nome e CPF opcional são gravados juntos em um UPDATE condicionado; CPF já preenchido só pode ser corrigido pelo suporte. O servidor valida os dígitos verificadores e usa a identidade da sessão. As migrations de avatar e CPF acrescentam colunas opcionais. Foto é recortada no cliente, validada e normalizada no servidor; somente o JPEG final é persistido. CPF, foto, nome e e-mail não integram os retornos públicos de auditoria/comprovantes.

## Revisão de organização (27/10/2026)

Leituras PostgreSQL usam snapshot RepeatableRead somente leitura, sem advisory lock. Antes de consultar carteira/lotes/comprovantes, uma consulta EXISTS detecta vencidos; apenas quando existem entra na liquidação transacional, que verifica novamente as condições. Escritas financeiras continuam serializadas para preservar reservas entre lotes. PGlite mantém uma fila local para suas transações.

O catálogo usa servidor/consultas/catalogo.ts: busca, artista, data, preço, status e ordenação parametrizados, com páginas de 12 registros sem imagem base64. useCatalogo usa SWRInfinite e polling de cinco segundos; GradeProgressiva solicita páginas por interseção. Facetas e totais são agregados no banco. Ordenação inclui ID para desempate. OFFSET pode deslocar registros quando o catálogo muda durante a navegação; revalidação e deduplicação reduzem esse efeito, mas não constituem snapshot entre requisições.

Liquidacao foi extraída para servidor/dominio/liquidacao.ts; o hook useDeposito concentra acompanhamento, persistência local e notificações, separado do formulário. Linhas SQL possuem contratos explícitos; isso não valida resultados em runtime como um ORM. Respostas da API externa passam por Zod. Erros HTTP não JSON recebem mensagem pública.

A auditoria continua verificando a cadeia completa antes de paginar sua apresentação: custo linear no número de lances. Não foi substituída por uma verificação parcial para ganhar desempenho. Home, miniplayer e área pessoal ainda usam seus endpoints próprios; a paginação nova é do catálogo.
