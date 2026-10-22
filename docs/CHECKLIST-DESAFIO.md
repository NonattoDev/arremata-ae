# Checklist do desafio Verzel — Arremata aê

Fonte: Teste tecnico Elite Dev - Verzel.pdf, 7 páginas. Conferido em 22/10/2026.

Auditoria de 22/10/2026: [x] significa implementação conferida no código e sustentada pelas evidências abaixo; não significa que cada controle tenha sido testado em todos os dispositivos. [ ] indica pendência. Publicação da revisão, revisão móvel e submissão têm caixas próprias. Referências de página apontam ao PDF original.

## Frontend — obrigatórios

### Tecnologia e acesso (p. 2 e 5)

- [x] Usar React, com ou sem framework.
- [x] Permitir acesso autenticado aos dois perfis: leiloeiro e licitante.
- [x] Apresentar as ações correspondentes ao perfil: leiloeiro gerencia seus lotes; licitante deposita e dá lances.

O PDF exige autenticação, mas não especifica campos, login social ou uma tela pública de cadastro. Escolhemos e-mail/senha e cadastro com seleção de perfil.

### Vitrine (p. 3)

- [x] Exibir os itens dos lotes.
- [x] Separar lotes ao vivo, agendados e encerrados.
- [x] Não exibir lotes cancelados na vitrine.

### Painel do leiloeiro (p. 2–3)

- [x] Buscar itens na API pública escolhida e selecionar um para criar um lote.
- [x] Mostrar imagem, título e atributos do item.
- [x] Permitir definir início, fim, lance inicial e incremento mínimo.
- [x] Permitir cancelar um lote que ainda não recebeu lances.
- [x] Mostrar o resultado dos lotes encerrados: se houve arremate e por quanto.
- [x] Mostrar o total recebido pelo leiloeiro.

### Sala do lote ao vivo (p. 3)

- [x] Mostrar lance atual e permitir enviar lance.
- [x] Mostrar histórico dos lances.
- [x] Mostrar a posição do usuário na disputa.
- [x] Mostrar contagem regressiva.
- [x] Indicar claramente quando o usuário está ganhando ou foi superado.
- [x] Atualizar essas informações sem recarregar a página.
- [x] Explicar cada recusa: abaixo do mínimo, saldo insuficiente, já é líder, lote não iniciado ou encerrado.

### Carteira e arremates (p. 3)

- [x] Mostrar saldo total, comprometido e disponível.
- [x] Permitir depósito simulado.
- [x] Mostrar os itens em que o usuário deu lance.
- [x] Mostrar os lotes vencidos, com comprovante e link para compartilhar.

### Auditoria pública (p. 2–4)

- [x] Permitir acesso sem login.
- [x] Mostrar o histórico completo dos lances do lote.
- [x] Informar se o histórico está íntegro ou adulterado.
- [x] Identificar licitantes na auditoria e no comprovante sem expor dados pessoais.

## Backend — obrigatórios

### Tecnologia, persistência e permissões (p. 2 e 5)

- [x] Usar Node.js ou Python; framework livre.
- [x] Usar banco de dados: PostgreSQL, MySQL ou NoSQL, como MongoDB.
- [x] Autenticar usuários e aplicar os dois papéis.
- [x] Permitir ao leiloeiro criar e gerenciar somente seus próprios lotes.
- [x] Impedir que leiloeiro dê lances.
- [x] Permitir ao licitante depositar saldo simulado, dar lances e arrematar.
- [x] Permitir cancelamento de lote sem lances e excluí-lo da vitrine.

### API pública e disponibilidade (p. 2 e 4)

- [x] Obter os itens de uma API pública; a categoria dos itens é livre.
- [x] Manter vitrine, salas, auditoria e comprovantes funcionando se a API externa cair.

### Regras dos lances e carteira (p. 4)

- [x] Aceitar lances apenas em lotes ao vivo, entre início e fim.
- [x] Exigir primeiro lance maior ou igual ao lance inicial.
- [x] Exigir lances seguintes maiores ou iguais ao lance atual mais o incremento mínimo.
- [x] Impedir que o líder cubra o próprio lance.
- [x] Calcular disponível = total − comprometido.
- [x] Aceitar o lance somente se couber no saldo disponível.
- [x] Comprometer o valor quando o licitante assume a liderança.
- [x] Liberar imediatamente esse valor quando ele for superado.
- [x] Aplicar anti-sniping: lance aceito nos últimos 2 minutos prorroga o fim para +2 minutos.

A redação do anti-sniping comporta interpretação. Nossa implementação usa fim = horário do lance aceito + 2 minutos, conforme documentado no projeto; isso é uma decisão nossa, não uma precisão adicional escrita no PDF.

### Encerramento, comprovante e integridade (p. 2 e 4)

- [x] Ao encerrar, debitar o vencedor e creditar o leiloeiro.
- [x] Gerar comprovante de arremate compartilhável por link.
- [x] Encerrar lotes sem lances sem vencedor.
- [x] Detectar alteração, remoção ou inserção posterior no histórico, inclusive diretamente no banco.
- [x] Explicar a técnica de proteção escolhida.
- [x] Não expor dados pessoais dos licitantes na auditoria nem no comprovante.

## Frontend — opcionais do PDF (p. 6)

- [x] Busca e filtro de lotes. A separação por status da vitrine e a busca na API para criar lote continuam obrigatórias.
- [x] Tema claro e escuro.
- [ ] Interface de cancelamento com estorno automático, caso esse opcional seja implementado também no backend.

## Backend / infraestrutura — opcionais do PDF (p. 6)

- [ ] Cancelamento de lote com estorno automático. Não confundir com o cancelamento obrigatório de lote sem lances.
- [ ] Docker Compose.
- [x] Testes automatizados — podem cobrir tanto frontend quanto backend.

## Entrega e documentação — obrigatórios (p. 2, 5 e 7)

- [x] Disponibilizar deploy público funcionando.
- [x] Disponibilizar repositório público no GitHub com a aplicação.
- [x] Deixar semeados 1 leiloeiro, 2 clientes e pelo menos 1 lote publicado aberto para lances na avaliação.
- [x] Incluir README detalhado com configuração e execução passo a passo.
- [x] Explicar no README como configurar e utilizar o banco.
- [x] Documentar funcionalidades com comportamento inesperado e limitações conhecidas.
- [ ] Enviar dentro do prazo: recebimento confirmado no e-mail de 22/10/2026 às 18h17 (Bahia); referência de 7 dias: 29/10/2026 às 18h17. O cumprimento só será marcado após o envio.
- [ ] Preencher nome completo e e-mail no formulário de entrega.
- [ ] Informar link do repositório; se frontend e backend estiverem em repositórios separados, informar ambos.
- [ ] Informar link público do deploy.
- [ ] Relatar onde e como a IA foi usada e o que foi revisado ou ajustado. O uso de IA é permitido.
- [ ] Enviar pelo formulário indicado: https://elitedev.verzel.com.br/?elite-dev-2026-2

## Dispensados explicitamente pelo PDF (p. 6)

Não é necessário fazer nota fiscal, revenda entre usuários, aplicativo nativo ou recuperação de senha. O dinheiro do desafio é simulado; integração de pagamento real não integra o fluxo solicitado.

## Nossas escolhas — não são exigências da Verzel

- Next.js com frontend React e backend Node.js no mesmo projeto. O PDF não exige backend em aplicação separada.
- HeroUI, Prisma, Server Actions e componentes pequenos/reutilizáveis.
- PostgreSQL Neon, Vercel e GitHub pessoal NonattoDev.
- Obras de arte da API pública do Cleveland Museum of Art.
- Home separada do catálogo, logomarca e navbar glass.
- Atualização por polling; o PDF exige atualização sem reload, mas não determina WebSocket.
- HMAC encadeado e checkpoint para auditoria; o PDF deixa a técnica livre.

## Situação do projeto e o que falta fechar

Revisão atual: código de todas as áreas obrigatórias lido; 13 testes automatizados aprovados; smoke HTTP local com três logins, lances, saldo, auditoria e imagem; cadastro/publicação/cancelamento/logout exercitados localmente. Vercel consultada: último deploy anterior READY; GitHub confirmado PUBLIC. Revisão 8b425bf publicada: deploy dpl_D7byTETGeiRUuF6LXER15bosWMUV READY e smoke HTTP autenticado aprovado na URL pública.

| Área | Evidência disponível | O que falta antes da entrega |
| --- | --- | --- |
| Funcionalidades de frontend | Telas implementadas; fluxos de login, carteira, lances e navegação já exercitados | Revisar todos os fluxos da interface final, incluindo cadastro e ambos os perfis |
| Interface final | Rotas, logo e navbar ajustadas localmente; TypeScript e build passaram | Validar versão final no celular; mudanças publicadas na revisão 8b425bf |
| Backend | Testes de regras, concorrência, reserva, liquidação e adulteração reexecutados | 13 testes aprovados nesta auditoria, incluindo indisponibilidade externa e propriedade entre leiloeiros |
| API externa | Importação real e imagem persistida registradas | Teste de falha de fetch aprovado: listagem, sala, lance, auditoria, liquidação, comprovante e imagem persistida independem da API |
| Produção | Vercel + Neon publicados; login, lance, auditoria, comprovante e cron real comprovados no registro anterior | Revisão 8b425bf READY; smoke com três logins e lances aprovado, comprovante público conferido sem login |
| Seed | 1 leiloeiro, 2 licitantes e lotes abertos registrados na publicação | Lote f7940e19-5a07-49df-ad30-b6cc22b66c72 confirmado aberto até 05/11/2026; reconferir na entrega |
| Opcionais | Busca/filtro, temas e testes implementados | Docker Compose e cancelamento com estorno não estão registrados como entregues; não bloqueiam o obrigatório |
| Documentação e envio | README e documentos técnicos existentes | Revisão do candidato, relato de IA, confirmação do prazo e envio do formulário |

### Ordem para fechar a entrega

Estas são nossas verificações de qualidade; não representam novos opcionais ou exigências textuais da banca.

- [ ] Percorrer o checklist obrigatório na versão final, com leiloeiro, dois licitantes e visitante sem login.
- [ ] Validar desktop e celular, especialmente cadastro, criação/cancelamento, lances, carteira, arremates e compartilhamento.
- [x] Conferir concorrência, saldo entre lotes, anti-sniping, liquidação única, adulteração e indisponibilidade externa. Suíte local aprovada; concorrência PostgreSQL independente registrada na validação anterior.
- [x] Publicar as alterações locais e repetir a conferência principal na URL pública. Commit 8b425bf, deploy READY e smoke autenticado aprovados.
- [x] Garantir contas de teste acessíveis e lote aberto para avaliação. Três logins aprovados; lote aberto até 05/11/2026, reconferir se a avaliação ocorrer depois.
- [ ] Revisar README, limitações e relato de IA; confirmar entendimento das decisões pelo candidato.
- [ ] Conferir prazo e links; enviar o formulário apenas com autorização explícita do candidato.

Evidências detalhadas: [VALIDACAO.md](VALIDACAO.md). Arquitetura: [ARQUITETURA.md](ARQUITETURA.md).

## Evidências por grupo auditado

| Itens | Código / evidência | Resultado |
| --- | --- | --- |
| React, Node e banco | package.json; route.ts runtime nodejs; prisma/schema.prisma e adapter PostgreSQL | Conferidos |
| Autenticação e papéis | commands/auth.ts, security.ts, commands/context.ts, commands/market.ts; smoke e cadastro HTTP local | Login dos três usuários, cadastro, sessão e logout aprovados |
| Vitrine e API | explore.tsx, catalog.ts, AuctionService.listLots; smoke de publicação/cancelamento | Categorias, imagem persistida e cancelado oculto conferidos |
| Painel e arremates | create-lot.tsx, my-lots.tsx, LotCard e Share | Resultado explícito e botão de compartilhar adicionados; cópia do link conferida no navegador |
| Sala e carteira | lot-room.tsx, countdown.tsx, use-resource.ts, wallet-page.tsx; testes e smoke | Posição, saldo e mensagens conferidos; polling de 2s |
| Auditoria e comprovante | domain/audit.ts, audit-page.tsx, receipt-page.tsx; testes SQL | Alteração, remoção e inserção detectadas; alias sem dados pessoais |
| Regras financeiras | auction.ts; tests/auction.test.ts e prisma-adapter.test.ts | Mínimos, horários, liderança, reserva, anti-sniping e liquidação aprovados |
| API indisponível | tests/catalog-outage.test.ts | Buscas/importações falham com mensagem; operações em lotes persistidos continuam |
| Permissão entre leiloeiros | tests/auction.test.ts | Segundo leiloeiro não cancela nem lista lotes do primeiro |
| HTML do painel/sala | Navegador detectou parágrafos aninhados; composição corrigida em my-lots e lot-room | Corrigido nesta auditoria |
| Deploy e repositório existentes | Vercel list_deployments: dpl_BbeBw7p5TnGNr8oaEe7hs2YYhaoQ READY; gh repo view: PUBLIC | Versão anterior confirmada; atualização final separada |

Prazo confirmado no e-mail que acompanha o PDF correto, recebido em 22/10/2026. O aviso anterior sobre Coderbyte e anexo de QA não é o início deste desafio. Não publicamos o conteúdo privado do e-mail no repositório.

### Publicação desta auditoria

- Commit de código: 8b425bf75642d44e40d05e4d42cc82ee1d77d9cd.
- Vercel NatosTech: dpl_D7byTETGeiRUuF6LXER15bosWMUV, READY em produção.
- Smoke público aprovado com três logins, saldo simulado, importação, lances, posição, auditoria e imagem; lote 2d86dc11-98c7-4c20-a1e2-8c8896942463.
- Comprovante público conferido no navegador sem login, com alias do vencedor e valor de R$110.
- Rascunho do relato de IA e links em [ENTREGA.md](ENTREGA.md); revisão do candidato e envio continuam pendentes.
