# Revisão de organização — 27/10/2026

Revisão estática do checkout 4219aa2, sem alterar regras ou dados. Não substitui avaliação da banca nem teste de carga.

## Achados por prioridade

1. **Alta — consultas e liquidação compartilham uma transação global.** `src/servidor/leilao.ts:323` lista todo o catálogo e liquida vencidos antes de retornar. Carteira e sala também fazem liquidação; `src/servidor/banco/postgres.ts` serializa transações com advisory lock global. O polling amplia esse trabalho. A proteção financeira é intencional e não deve ser simplesmente removida. Separar consultas e liquidação exige preservar encerramento, reservas e concorrência em testes.
2. **Média — rolagem infinita apenas visual.** `src/funcionalidades/leiloes/catalogo.tsx:44` recebe todos os lotes e filtra/ordena no cliente. `src/componentes/leiloes/grade-progressiva.tsx:38` revela blocos com `slice`; não busca páginas no servidor. Implementar filtros e paginação na consulta para limitar transferência e trabalho conforme o catálogo cresce. A auditoria também pagina a resposta depois de carregar/verificar toda a cadeia; preservar a verificação integral ao otimizar, sem confundir página de interface com custo limitado no banco.
3. **Média — tipagem SQL e integração externa permissivas.** `src/servidor/banco/tipos.ts:1` usa `Record<string, any>` como retorno padrão; `src/servidor/catalogo.ts:36` e `:39` usam `any` na resposta externa. Criar contratos explícitos para linhas e validar dados externos antes do mapeamento. Ter Prisma instalado não torna o SQL raw automaticamente tipado.
4. **Média — responsabilidades concentradas.** `src/servidor/leilao.ts` tem 414 linhas e reúne usuários, depósitos, consultas, lances, cancelamentos e liquidação. `src/funcionalidades/carteira/depositar-saldo.tsx` tem 280 linhas com persistência local, polling, notificação, relógio e formulário. Extrair operações de domínio e um hook de acompanhamento de depósito em etapas; manter a transação sob um coordenador para não fragmentar atomicidade. O tamanho é um indício, não uma regra para dividir arquivos artificialmente.
5. **Média — erro HTTP pode vazar como erro de parsing.** `src/lib/api.ts:3` tenta JSON antes de verificar o status. Resposta de timeout em texto/HTML gera erro técnico de parsing. Tratar resposta não JSON com mensagem pública e preservar diagnóstico no servidor.
6. **Baixa — Action sem uso confirmado no repositório.** `src/servidor/actions/carteira.ts:6` exporta `depositarAcao`, sem importadores ou referências fora do próprio arquivo. O fluxo atual usa `actions/depositos.ts`. Candidata à remoção. **Não remover** o comando `depositar` nem o método de serviço: são usados por HTTP, seed e testes.
7. **Baixa — documentação divergente.** `AGENTS.md` menciona `src/features`/`src/components`, mas a estrutura real e `ARQUITETURA.md` usam `src/funcionalidades`/`src/componentes`. A arquitetura descreve seis modelos, enquanto o schema também contém modelos adicionados posteriormente. Atualizar as orientações para refletir o projeto entregue.

## O que está bem estruturado

- Rotas do App Router separadas das telas; componentes compartilhados, hooks e bibliotecas com pastas próprias.
- Actions delegam a comandos validados/autorizados, sem replicar regras financeiras nos componentes.
- Schema e migrations versionados; testes de reservas, concorrência, liquidação, estorno e integridade.
- Maior arquivo próprio de produção: 414 linhas. Arquivos maiores do cliente Prisma são gerados e não estão versionados; não são código manual para refatorar.
- `ficha-acervo.tsx` tem 289 linhas, mas parte relevante é configuração declarativa de campos. Não classificá-lo como problema apenas pelo tamanho.

## Verificação executada

- `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`: passou.
- `npm test`: 35 testes aprovados, zero falhas.
- Inventário de imports estáticos de src, scripts e testes: somente a Action de carteira apareceu sem importadores entre módulos próprios fora de app. Busca textual confirmou o caso. Não equivale a análise completa de exports, assets ou dependências implícitas.
- Busca de arquivos versionados com nomes de debug, backup, logs e screenshots: nenhum candidato encontrado nesse recorte.
- Nenhuma mudança de implementação, remoção, commit, push ou alteração de banco nesta revisão.

## Ordem recomendada

1. Remover a Action órfã e corrigir documentação.
2. Fortalecer resposta HTTP e contratos de dados.
3. Extrair acompanhamento de depósito e operações do serviço, preservando comportamento.
4. Otimizar consultas/paginação e revalidar concorrência em PostgreSQL antes da publicação.

Build e testes aprovados não demonstram ausência de gargalos, nem certificam comportamento mobile ou produção. Esses cenários não foram repetidos nesta revisão estática.

## Correções posteriores à revisão — 27/10/2026

Os sete achados acima foram tratados: leituras consistentes separadas do bloqueio financeiro, catálogo paginado e filtrado no servidor, contratos SQL explícitos e validação da API externa, extração da liquidação e do hook de depósito, tratamento de respostas HTTP inválidas, remoção da Action órfã e atualização da arquitetura.

A consulta pública paginada usa `/api/auction-catalog`; `/api/catalog` continua reservado à busca de obras do leiloeiro. A revisão dos oito modelos, CHECKs e índices está em REVISAO-SCHEMA.md.

Validação após as correções: 37 testes aprovados, zero falhas; TypeScript com verificação de declarações não usadas, Prisma validate, build e git diff --check aprovados. Os testes de banco usam PGlite isolado. Esta rodada não repete a homologação visual, concorrência em PostgreSQL ou validação autenticada em produção. Nenhuma migration foi aplicada em produção e nenhuma publicação foi realizada.