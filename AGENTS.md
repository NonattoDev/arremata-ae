<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Arquitetura exigida pelo proprietário

- Manter componentes pequenos e reaproveitáveis; telas ficam em `src/features`, componentes compartilhados em `src/components`.
- Usar rotas próprias do App Router; não concentrar telas em um roteador manual.
- Mutações da interface usam Server Actions. Validar entrada, sessão e autorização no servidor através dos comandos compartilhados.
- Manter schema e migrations do banco no Prisma. SQL crítico existente é parametrizado e executado pelo adapter Prisma; nunca interpolar entrada de usuário.
- Regras financeiras e auditoria permanecem transacionais e cobertas pelos testes do teste técnico.
- Não acumular funcionalidades sem relação em arquivos grandes. Separar responsabilidades antes de ampliar um módulo.
- Ler `docs/ARQUITETURA.md` e `docs/REQUISITOS.md` antes de mudar arquitetura/regras.
- Não abrir Chrome para testar; usar o navegador integrado já disponível no Codex.
