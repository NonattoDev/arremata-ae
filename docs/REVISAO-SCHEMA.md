# Revisão completa do schema — 27/10/2026

Escopo: schema Prisma, migrations SQL e consultas do código. Não houve inspeção de dados pessoais nem aplicação de migration em produção nesta revisão.

## Modelos e decisões

| Modelo / tabela | Responsabilidade e relações | Proteções existentes | Pontos de atenção |
| --- | --- | --- | --- |
| Usuario / users | Identidade, perfil, saldo; possui sessões, lances, lotes e depósitos | PK, e-mail e apelido únicos, saldo não negativo, papel limitado por CHECK | CPF e nascimento opcionais no cadastro; serviço exige ambos para lance. CPF não é único no banco. Unicidade exige decisão sobre contas existentes e dados de teste. E-mail é normalizado pelo comando, não por índice case-insensitive. |
| Sessao / sessions | Token armazenado como hash, usuário e expiração | FK para usuário; expiração verificada na autenticação | Novos índices por usuário e expiração. Expiração não apaga automaticamente a linha; limpeza periódica é evolução operacional. |
| Lote / lots | Obra, leiloeiro, líder, valores, período e fechamento | FKs, CHECK de valores iniciais/incremento positivos, fim após início e estados válidos | JSONB preserva snapshot da API, inclusive imagem. Isso aumenta armazenamento; separar imagem em storage é evolução. Contador e valor atual não têm CHECK de não negatividade; são mantidos pelo serviço. Comprovante JSON não possui FK própria. |
| Lance / bids | Histórico imutável de ofertas por lote e licitante | Valor positivo, FK, sequência única por lote, cadeia HMAC | Sequência positiva é regra de serviço, sem CHECK. Apelido é snapshot público, não nome civil. Assinaturas dependem de segredo estável fora do banco. |
| Movimentacao / ledger | Registro financeiro de depósito, compra e venda | FKs; unicidade usuário/lote/tipo evita liquidação repetida | Lote pode ser nulo em depósitos; PostgreSQL permite múltiplas linhas com nulo na chave única. Depósitos usam identidade e transação para evitar repetição. Tipo e sinal não têm CHECK; serviço controla. Reserva é calculada pelos lotes liderados, não uma linha de débito. |
| LimiteTentativas / rate_limits | Contagem de tentativas e janela por chave | PK; atualização transacional | Sem CHECK de hits não negativo e sem expurgo automático. Não é histórico financeiro. |
| DepositoSimulado / deposit_simulations | Solicitação Pix/cartão simulada e confirmação | FK, valor positivo limitado, métodos/estados em CHECK, índice usuário/data | confirmed_at é nullable. Coerência entre estado e datas é controlada pelo comando, não por CHECK. Não armazena número de cartão ou CVV. |
| PreferenciaNovidades / auction_news_preferences | Canais e contatos escolhidos por usuário/lote | PK composta, FKs, validação dos contatos pelo comando | Novo índice por lote. Não envia mensagens; integrações não estão conectadas. Contatos são privados e não devem entrar nos retornos públicos. |

## Índices preparados nesta revisão

Migration `20261027000000_indices_consultas`:

- `sessions_user` e `sessions_expiry`: sessão por usuário e expiração.
- `lots_leader_status`: cálculo de reservas.
- `lots_seller_created`: listagem do leiloeiro.
- `auction_news_preferences_lot`: consulta por lote.
- Remove `bids_lot`: duplicava as mesmas colunas cobertas pelo índice único `(lot_id, sequence)`.

Os índices equivalentes foram exercitados pelo bootstrap isolado de testes; o arquivo de migration ainda precisa ser validado pelo fluxo de deploy em PostgreSQL. Ainda não foi aplicada ao banco de produção. Seguir o procedimento de migrations do README na publicação; não usar reset nem db push.

## Tipos, integridade e datas

Dinheiro fica em BigInt, em centavos, com limites nas entradas antes da conversão para Number. Instantes usam timestamptz; nascimento usa DATE, pois não representa horário. Interface formata em pt-BR sem alterar registros assinados.

Relações usam NoAction: não apagar usuário/lote com histórico financeiro em cascata. IDs e chaves físicas foram preservados; renomear campos de payload HMAC invalidaria históricos. O schema Prisma não expressa todos os CHECKs: as migrations SQL são parte obrigatória da revisão.

O saldo e o ledger devem mudar na mesma transação. Escritas mantêm advisory lock global. Leituras PostgreSQL usam transação RepeatableRead somente leitura; liquidação continua serializada e idempotente. A auditoria integral é linear no número de lances, mesmo quando a interface mostra páginas.

## Evoluções que exigem decisão separada

1. CPF único por pessoa: avaliar regras de múltiplos papéis e duplicidades existentes antes de migrar.
2. Novos CHECKs para contadores, sequência e consistência estado/data: auditar registros existentes antes de aplicar.
3. Imagens fora de JSONB e índices de busca por artista/data/preço: medir volume e plano de execução antes de acrescentar estruturas.
4. Locks por carteira/lote e auditoria de grande volume: exigem provas de concorrência e integridade; não remover a proteção global apenas por desempenho.

Esses pontos não são apresentados como correções já feitas. São os limites e decisões identificados na revisão do banco inteiro.
