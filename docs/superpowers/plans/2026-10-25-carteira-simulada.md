# Carteira com depósitos simulados — plano

Escopo autorizado: saldo com ícones/cores, explicação visual das reservas e fluxos Pix/cartão fictícios. Sem PSP, cobrança ou armazenamento de cartão. Implementação sequencial no checkout atual.

- [x] Persistir intenção de depósito (usuário, valor, método, prazo, estado); crédito e extrato atômicos e idempotentes. Autorização por sessão e QR opaco com expiração.
- [x] Server Actions para iniciar, acompanhar, cancelar e confirmar QR. Polling confirma Pix após 30s e cartão após 3s, usando relógio do servidor. Uma intenção pendente por usuário.
- [x] Componentes separados: página com resumo/reserva, formulário cartão, painel Pix e controlador. HeroUI, QR local via qrcode, bandeiras via credit-card-type. Cartão somente no estado React; oferecer preenchimento de exemplo.
- [x] QR abre confirmação simulada em página própria. Saldo atualizado pela carteira via SWR; QR não é um código Pix bancário.
- [x] Testes: autorização, valores, prazo, cancelamento, expiração e corrida QR/polling sem duplicação. Verificar desktop e mobile antes de publicar.

Validação: 28 testes passaram; TypeScript e Prisma válidos; build compilado. Migração aplicada somente no banco local. QR testado pelo link de confirmação (sem leitura por câmera física). Dados de cartão fictícios; servidor recebe somente método e valor. Dev executado com Webpack durante revisão, pois Turbopack apresentou recarregamentos contínuos neste ambiente.

