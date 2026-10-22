# Arremata aê — contrato de implementação

Fonte: PDF de 7 páginas do teste Elite Dev Verzel recebido em 22/10/2026. Este documento é a rastreabilidade do enunciado; não equivale a aprovação da banca.

## Escopo obrigatório

1. React (Next.js) + HeroUI; back-end Node.js no Next.js; PostgreSQL.
2. Autenticação e papéis exclusivos: leiloeiro gerencia só seus lotes e não dá lances; licitante deposita saldo simulado e participa.
3. Itens provenientes de API pública; tema escolhido: arte em domínio público do Cleveland Museum of Art. Persistir dados e imagem para tolerar indisponibilidade externa.
4. Criar lote com imagem, título, atributos, início/fim, lance inicial e incremento. Cancelar lote sem lances. Resultados e total recebido do leiloeiro.
5. Vitrine separa agendados/ao vivo/encerrados; oculta cancelados.
6. Sala atualizada sem recarregar: lance, histórico, posição, contagem regressiva, indicador líder/superado. Polling de 2 segundos com hora do servidor é a estratégia inicial compatível com Vercel.
7. Carteira: total, comprometido e disponível; depósitos simulados; reserva por lote; liberação imediata ao ser superado; saldo compartilhado entre lotes.
8. Lances apenas entre início inclusivo e fim exclusivo. Primeiro >= inicial; demais >= atual + incremento; líder não cobre próprio lance; mensagens específicas para recusas.
9. Anti-sniping: lance aceito nos últimos 2 minutos altera fim para instante do lance + 2 minutos. Interpretação documentada da frase “estende o fim do lote para +2 minutos”.
10. Liquidação atômica e idempotente: débito do vencedor, crédito do leiloeiro, comprovante compartilhável; sem lances, sem vencedor. Cron autenticado e liquidação oportunista nas leituras/mutações; o banco impede lances após horário mesmo antes do cron.
11. Auditoria pública: encadeamento HMAC e checkpoint autenticado para detectar alteração/inserção/exclusão, inclusive última linha. Chave fora do banco. Identificadores públicos aleatórios, sem nome/e-mail de licitante. Documentar limites contra restauração integral de snapshot e comprometimento da chave.
12. Meus arremates: participações e vitórias, comprovantes e links públicos.
13. Seed: 1 leiloeiro, 2 licitantes, >=1 lote aberto. README: instalação, execução, banco, contas de teste, decisões, limitações e IA.
14. Entrega: GitHub pessoal público, deploy funcionando, formulário com links e relato honesto de IA. Não enviar automaticamente o formulário.

## Opcionais

Busca/filtro, cancelamento com estorno, Docker Compose, testes, temas claro/escuro. Priorizamos testes de integridade antes dos outros opcionais.

## Fora do escopo

Nota fiscal, revenda, app nativo, recuperação de senha, pagamentos reais.

## Verificação exigida antes de declarar entrega pronta

- Concorrência no mesmo lote e em lotes distintos com a mesma carteira.
- Limites exatos de início/fim/incremento, reserva/liberação e anti-sniping.
- Encerramento repetido e concorrente não transfere valor duas vezes.
- Alteração, inserção, remoção no meio e no fim do histórico são detectadas.
- Papéis e propriedade validados no servidor, sessões HttpOnly, proteção de origem nas escritas.
- API externa fora do ar não quebra lotes existentes.
- Fluxos reais no navegador desktop/mobile e deploy autenticado.

## Plano de execução

1. Estrutura Next.js/HeroUI/TypeScript, schema e migrations Prisma e adapter PostgreSQL; PGlite (PostgreSQL WASM) apenas para desenvolvimento/testes locais.
2. Testes de domínio e integração SQL antes das implementações críticas.
3. Serviços transacionais de carteira, lotes, lances, liquidação, comprovantes e auditoria.
4. Autenticação e endpoints, integração com catálogo e seed.
5. Interface responsiva das sete áreas exigidas e estados de erro/carregamento.
6. Testes, typecheck, build e navegação real; registrar evidências e pendências.
7. Em etapa de publicação: PostgreSQL hospedado, variáveis na Vercel, Git deploy, cron habilitado e prova dos fluxos na URL pública. Cron por minuto depende de plano Vercel compatível; não declarar essa etapa concluída sem verificação.
