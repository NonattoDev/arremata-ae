# Arquitetura modular — Implementation Plan

**Goal:** Componentizar a aplicação e adotar Server Actions e Prisma sem alterar as regras do teste.
**Architecture:** Telas por funcionalidade consomem componentes, hooks e contratos compartilhados. Actions validam entrada/sessão e chamam serviços transacionais. Prisma define modelos, relações, índices e migrations PostgreSQL; SQL parametrizado permanece nas operações críticas de concorrência.
**Tech Stack:** Next.js, HeroUI, TypeScript, Zod, Prisma, PostgreSQL.
**Spec:** docs/REQUISITOS.md e pedido explícito do usuário nesta conversa.

## Restrições

- Preservar os dados existentes e os contratos públicos.
- Autorização e validação sempre no servidor; identidade nunca fornecida pelo cliente.
- Valores monetários em centavos, transações e lock global preservados.
- Sem abrir Chrome; validação visual somente no navegador integrado.

## Execução

- [x] Extrair tipos, formatação, transporte de leitura, hook de polling, componentes e telas em módulos focados.
- [x] Extrair comandos compartilhados entre HTTP e Server Actions; usar Actions em todas as mutações da interface.
- [x] Modelar User, Session, Lot, Bid, LedgerEntry e RateLimit no Prisma com mapeamento das tabelas existentes; versionar migration e gerar cliente.
- [x] Integrar Prisma no adapter PostgreSQL, mantendo PGlite local e testes com a mesma migration.
- [x] Separar auditoria do serviço de leilões e documentar limites de cada camada.
- [x] Rodar validação Prisma, testes, typecheck e build; revisar diff e registrar limitações de validação.

## Review Focus

Sessões inválidas, papéis incorretos, manipulação de valores, concorrência/reserva entre lotes e adulteração do histórico continuam cobertos pela validação no servidor e testes de domínio. Verificar ainda o contrato serializável das Actions e o schema SQL efetivamente aplicado.
