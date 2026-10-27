import { consultarCatalogo } from "./consultas/catalogo";
import type { UsuarioBanco, LoteBanco } from "./banco/linhas";
import { liquidarVencidos } from "./dominio/liquidacao";
import { randomUUID } from "node:crypto";
import { validarCpf } from "../lib/cpf";
import type { BancoDados, Consultavel } from "./banco";

import {
  ErroDominio,
  type ItemCatalogo,
  type DadosNovoLote,
} from "./dominio/tipos";
export {
  ErroDominio,
  type ItemCatalogo,
  type DadosNovoLote,
} from "./dominio/tipos";
const paraIso = (valor: string | Date) => new Date(valor).toISOString();
function validarDinheiro(valor: number) {
  if (!Number.isSafeInteger(valor) || valor <= 0 || valor > 1000000000)
    throw new ErroDominio(
      "Valor inválido. Informe um valor positivo em centavos.",
    );
}

import { ServicoAuditoria } from "./dominio/auditoria";

export class ServicoLeiloes {
  private integridade: ServicoAuditoria;
  constructor(
    private banco: BancoDados,
    segredo: string,
    private agora: () => number = Date.now,
  ) {
    this.integridade = new ServicoAuditoria(segredo);
  }
  private async usuario(transacao: Consultavel, id: string, papel?: string) {
    const [usuarioBanco] = await transacao.busca<UsuarioBanco>(
      "SELECT * FROM users WHERE id=$1",
      [id],
    );
    if (!usuarioBanco) throw new ErroDominio("Entre para continuar.", 401);
    if (papel && usuarioBanco.role !== papel)
      throw new ErroDominio(
        papel === "bidder"
          ? "Apenas licitantes podem realizar esta ação."
          : "Apenas leiloeiros podem realizar esta ação.",
        403,
      );
    return usuarioBanco;
  }
  private async lote(transacao: Consultavel, id: string) {
    const [loteBanco] = await transacao.busca<LoteBanco>(
      "SELECT * FROM lots WHERE id=$1",
      [id],
    );
    if (!loteBanco) throw new ErroDominio("Lote não encontrado.", 404);
    return loteBanco;
  }
  private async saldos(transacao: Consultavel, id: string) {
    const usuarioBanco = await this.usuario(transacao, id);
    const [linha] = await transacao.busca(
      "SELECT COALESCE(SUM(current_amount),0) AS committed FROM lots WHERE leader_id=$1 AND status='open'",
      [id],
    );
    const total = Number(usuarioBanco.balance),
      comprometido = Number(linha.committed);
    return { total, committed: comprometido, available: total - comprometido };
  }
  private async atualizarVencidos() {
    const [resultado] = await this.banco.busca<{ existe: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM lots WHERE status='open' AND ends_at <= $1) AS existe",
      [new Date(this.agora())],
    );
    // Só entra na fila financeira quando existe trabalho de liquidação.
    // A transação verifica novamente os lotes, mantendo a operação idempotente.
    if (resultado.existe) await this.liquidar();
  }
  async criarUsuario(
    email: string,
    nome: string,
    hash: string,
    papel: "seller" | "bidder",
  ) {
    const id = randomUUID();
    await this.banco.busca(
      "INSERT INTO users (id,email,name,password_hash,role,alias) VALUES ($1,$2,$3,$4,$5,$6)",
      [
        id,
        email.toLowerCase().trim(),
        nome,
        hash,
        papel,
        `Participante ${randomUUID().slice(0, 8)}`,
      ],
    );
    return id;
  }
  async depositar(id: string, valor: number) {
    validarDinheiro(valor);
    return this.banco.transacionar(async (transacao) => {
      await this.usuario(transacao, id, "bidder");
      await liquidarVencidos(transacao, this.integridade, this.agora);
      const saldo = await this.saldos(transacao, id);
      if (saldo.total + valor > 1000000000000)
        throw new ErroDominio("Limite de saldo simulado atingido.");
      await transacao.busca("UPDATE users SET balance=balance+$2 WHERE id=$1", [
        id,
        valor,
      ]);
      await transacao.busca(
        "INSERT INTO ledger (id,user_id,amount,kind,created_at) VALUES ($1,$2,$3,$4,$5)",
        [randomUUID(), id, valor, "deposit", new Date(this.agora())],
      );
      return this.saldos(transacao, id);
    });
  }
  async carteira(id: string) {
    await this.atualizarVencidos();
    return this.banco.lerConsistente(async (transacao) => {
      return this.saldos(transacao, id);
    });
  }
  async criarLote(leiloeiro: string, entrada: DadosNovoLote) {
    validarDinheiro(entrada.initial);
    validarDinheiro(entrada.increment);
    const inicio = Date.parse(entrada.startsAt),
      fim = Date.parse(entrada.endsAt);
    if (
      !Number.isFinite(inicio) ||
      !Number.isFinite(fim) ||
      fim <= inicio ||
      fim <= this.agora()
    )
      throw new ErroDominio(
        "Datas inválidas: o fim deve ser futuro e posterior ao início.",
      );
    return this.banco.transacionar(async (transacao) => {
      await this.usuario(transacao, leiloeiro, "seller");
      const id = randomUUID(),
        head = this.integridade.assinar(["genesis-v1", id]);
      await transacao.busca(
        "INSERT INTO lots (id,seller_id,item,initial,increment,starts_at,ends_at,head_hash,checkpoint) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          id,
          leiloeiro,
          JSON.stringify(entrada.item),
          entrada.initial,
          entrada.increment,
          new Date(inicio),
          new Date(fim),
          head,
          "pending",
        ],
      );
      await this.integridade.salvarPontoVerificacao(transacao, id);
      return id;
    });
  }
  async darLance(idUsuario: string, idLote: string, valor: number) {
    validarDinheiro(valor);
    return this.banco.transacionar(async (transacao) => {
      const usuarioBanco = await this.usuario(transacao, idUsuario, "bidder");
      if (
        !usuarioBanco.cpf ||
        !validarCpf(usuarioBanco.cpf) ||
        !usuarioBanco.nascimento ||
        new Date(usuarioBanco.nascimento).getTime() >= this.agora()
      )
        throw new ErroDominio(
          "Complete seu CPF e sua data de nascimento antes de dar lance.",
          403,
        );
      await liquidarVencidos(transacao, this.integridade, this.agora);
      const loteBanco = await this.lote(transacao, idLote);
      const agora = this.agora();
      await this.integridade.exigirIntegridade(transacao, loteBanco);
      if (
        loteBanco.status !== "open" ||
        agora >= new Date(loteBanco.ends_at).getTime()
      )
        throw new ErroDominio("Lote encerrado ou cancelado.");
      if (agora < new Date(loteBanco.starts_at).getTime())
        throw new ErroDominio("Lote ainda não iniciado.");
      if (loteBanco.leader_id === idUsuario)
        throw new ErroDominio("Você já está ganhando este lote.");
      const minimo = loteBanco.bid_count
        ? Number(loteBanco.current_amount) + Number(loteBanco.increment)
        : Number(loteBanco.initial);
      if (valor < minimo)
        throw new ErroDominio(
          `Lance abaixo do mínimo: R$ ${(minimo / 100).toFixed(2)}.`,
        );
      if ((await this.saldos(transacao, idUsuario)).available < valor)
        throw new ErroDominio("Saldo disponível insuficiente.");
      const lanceBanco = {
        id: randomUUID(),
        lot_id: idLote,
        bidder_id: idUsuario,
        alias: usuarioBanco.alias,
        amount: valor,
        sequence: loteBanco.bid_count + 1,
        placed_at: new Date(agora),
        previous_hash: loteBanco.head_hash,
      };
      const hash = this.integridade.hashLance(lanceBanco);
      const fim =
        new Date(loteBanco.ends_at).getTime() - agora <= 120000
          ? new Date(agora + 120000)
          : loteBanco.ends_at;
      await transacao.busca(
        "INSERT INTO bids (id,lot_id,bidder_id,alias,amount,sequence,placed_at,previous_hash,hash) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
        [
          lanceBanco.id,
          idLote,
          idUsuario,
          usuarioBanco.alias,
          valor,
          lanceBanco.sequence,
          lanceBanco.placed_at,
          lanceBanco.previous_hash,
          hash,
        ],
      );
      await transacao.busca(
        "UPDATE lots SET current_amount=$2,leader_id=$3,bid_count=$4,head_hash=$5,ends_at=$6 WHERE id=$1",
        [idLote, valor, idUsuario, lanceBanco.sequence, hash, fim],
      );
      await this.integridade.salvarPontoVerificacao(transacao, idLote);
      return { accepted: true, endsAt: paraIso(fim) };
    });
  }
  async cancelar(idUsuario: string, idLote: string) {
    return this.banco.transacionar(async (transacao) => {
      await this.usuario(transacao, idUsuario, "seller");
      await liquidarVencidos(transacao, this.integridade, this.agora);
      const loteBanco = await this.lote(transacao, idLote);
      await this.integridade.exigirIntegridade(transacao, loteBanco);
      if (loteBanco.seller_id !== idUsuario)
        throw new ErroDominio("Sem permissão para este lote.", 403);
      if (loteBanco.status === "cancelled") return;
      if (loteBanco.status !== "open")
        throw new ErroDominio("Este lote já foi encerrado ou cancelado.");
      // A reserva é calculada pelos lotes abertos. Cancelar libera o valor
      // na mesma transação; creditar balance aqui duplicaria o dinheiro.
      await transacao.busca("UPDATE lots SET status='cancelled' WHERE id=$1", [
        idLote,
      ]);
      await this.integridade.salvarPontoVerificacao(transacao, idLote);
    });
  }
  async liquidar() {
    return this.banco.transacionar((transacao) =>
      liquidarVencidos(transacao, this.integridade, this.agora),
    );
  }
  private lotePublico(loteBanco: LoteBanco, idUsuario?: string) {
    const situacao =
      loteBanco.status !== "open"
        ? loteBanco.status
        : this.agora() < new Date(loteBanco.starts_at).getTime()
          ? "scheduled"
          : this.agora() >= new Date(loteBanco.ends_at).getTime()
            ? "closed"
            : "live";
    return {
      id: loteBanco.id,
      item: {
        ...loteBanco.item,
        image: `/api/lots/${loteBanco.id}/image`,
      } as ItemCatalogo,
      initial: Number(loteBanco.initial),
      increment: Number(loteBanco.increment),
      currentAmount: Number(loteBanco.current_amount),
      bidCount: loteBanco.bid_count as number,
      startsAt: paraIso(loteBanco.starts_at),
      endsAt: paraIso(loteBanco.ends_at),
      status: situacao as string,
      isLeader:
        situacao !== "cancelled" &&
        !!idUsuario &&
        loteBanco.leader_id === idUsuario,
      isOwner: !!idUsuario && loteBanco.seller_id === idUsuario,
      hasWinner: !!loteBanco.receipt,
    };
  }
  async catalogo(entrada: unknown, idUsuario?: string) {
    await this.atualizarVencidos();
    return this.banco.lerConsistente(async (transacao) => {
      const resultado = await consultarCatalogo(
        transacao,
        entrada,
        this.agora(),
      );
      return {
        ...resultado,
        lotes: resultado.lotes.map((lote) => this.lotePublico(lote, idUsuario)),
      };
    });
  }
  async listarLotes(idUsuario?: string, modo = "all") {
    // A imagem tem sua própria rota; não precisamos transportar o base64 na listagem.
    const campos =
      "id, seller_id, item - 'image' AS item, initial, increment, current_amount, bid_count, starts_at, ends_at, status, leader_id, receipt";
    await this.atualizarVencidos();
    return this.banco.lerConsistente(async (transacao) => {
      const lotes =
        modo === "seller"
          ? await transacao.busca<LoteBanco>(
              `SELECT ${campos} FROM lots WHERE seller_id=$1 ORDER BY created_at DESC`,
              [idUsuario],
            )
          : modo === "mine"
            ? await transacao.busca<LoteBanco>(
                `SELECT ${campos} FROM lots WHERE id IN (SELECT lot_id FROM bids WHERE bidder_id=$1) ORDER BY created_at DESC`,
                [idUsuario],
              )
            : await transacao.busca<LoteBanco>(
                `SELECT ${campos} FROM lots WHERE status != 'cancelled' ORDER BY created_at DESC`,
              );
      return lotes.map((loteBanco) => this.lotePublico(loteBanco, idUsuario));
    });
  }
  async obterLote(id: string, idUsuario?: string) {
    await this.atualizarVencidos();
    return this.banco.lerConsistente(async (transacao) => {
      const loteBanco = await this.lote(transacao, id);
      const auditar = await this.integridade.auditarDados(transacao, loteBanco);
      const posicoes = await transacao.busca(
        "SELECT bidder_id, MAX(amount) AS amount FROM bids WHERE lot_id=$1 GROUP BY bidder_id ORDER BY MAX(amount) DESC",
        [id],
      );
      return {
        ...this.lotePublico(loteBanco, idUsuario),
        ...auditar,
        position: idUsuario
          ? posicoes.findIndex(
              (resultado) => resultado.bidder_id === idUsuario,
            ) + 1
          : 0,
        serverTime: new Date(this.agora()).toISOString(),
      };
    });
  }
  async auditar(id: string, paginaSolicitada?: number) {
    return this.banco.lerConsistente(async (transacao) => {
      const loteBanco = await this.lote(transacao, id);
      const auditoria = await this.integridade.auditarDados(
        transacao,
        loteBanco,
      );
      const porPagina = 25;
      const total = auditoria.bids.length;
      const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
      const pagina = Math.min(Math.max(1, paginaSolicitada ?? 1), totalPaginas);
      const fim = Math.max(0, total - (pagina - 1) * porPagina);
      return {
        lotId: id,
        title: loteBanco.item.title,
        ...auditoria,
        bids:
          paginaSolicitada === undefined
            ? auditoria.bids
            : auditoria.bids.slice(Math.max(0, fim - porPagina), fim),
        total,
        pagina,
        totalPaginas,
        porPagina,
        verificadoEm: new Date(this.agora()).toISOString(),
      };
    });
  }
  async comprovante(id: string) {
    await this.atualizarVencidos();
    return this.banco.lerConsistente(async (transacao) => {
      const loteBanco = await this.lote(transacao, id);
      await this.integridade.exigirIntegridade(transacao, loteBanco);
      if (!loteBanco.receipt)
        throw new ErroDominio(
          "Este lote não possui comprovante de arremate.",
          404,
        );
      return {
        ...loteBanco.receipt,
        item: {
          ...loteBanco.item,
          image: `/api/lots/${loteBanco.id}/image`,
        } as ItemCatalogo,
        checkpoint: loteBanco.checkpoint,
      };
    });
  }
}
