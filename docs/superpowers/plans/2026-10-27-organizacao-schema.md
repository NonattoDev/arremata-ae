# Organização e revisão do banco

Objetivo: corrigir os sete achados de REVISAO-ORGANIZACAO.md preservando as regras financeiras.
Arquitetura: Next.js, Server Actions, serviços de domínio e Prisma/PostgreSQL.
Restrições: não executar seeds, resets ou migrations no banco de produção. Preservar formatos assinados pela auditoria.

- [x] Separar leituras consistentes da fila financeira e testar liquidação.
- [x] Paginar e filtrar catálogo no servidor.
- [x] Tipar consultas e validar respostas externas.
- [x] Separar responsabilidades de leilões e depósitos.
- [x] Tratar respostas HTTP não JSON.
- [x] Remover action sem consumidores.
- [x] Atualizar documentação e revisar os oito modelos e suas restrições SQL.
- [x] Executar testes, typecheck e build.

Revisão: concorrência, idempotência, compatibilidade das assinaturas, filtros e isolamento de produção.
