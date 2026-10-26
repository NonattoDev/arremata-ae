"use server";

import { z } from "zod";
import { contextoAcao, resultadoAcao } from "./suporte";
import { exigirUsuario } from "../comandos/contexto";
import { ErroDominio } from "../leilao";

import {
  esquemaPreferenciasNovidades as esquema,
  preferenciasVazias,
  type PreferenciasNovidades,
} from "@/lib/preferencias-novidades";

export async function consultarNovidadesAcao(loteId: string) {
  return resultadoAcao(async () => {
    const contexto = await contextoAcao();
    const usuario = await exigirUsuario(contexto);
    const [preferencia] = await contexto.db.busca<PreferenciasNovidades>(
      'SELECT whatsapp,telegram,email,whatsapp_number AS "numeroWhatsapp",telegram_username AS "usuarioTelegram" FROM auction_news_preferences WHERE user_id=$1 AND lot_id=$2',
      [usuario.id, z.uuid().parse(loteId)],
    );
    return preferencia ?? preferenciasVazias;
  });
}

export async function salvarNovidadesAcao(entrada: unknown) {
  return resultadoAcao(async () => {
    const dados = esquema.parse(entrada);
    const contexto = await contextoAcao();
    const usuario = await exigirUsuario(contexto);
    await contexto.db.transacionar(async (banco) => {
      const [lote] = await banco.busca(
        "SELECT id FROM lots WHERE id=$1 AND status='open' AND starts_at > now() FOR UPDATE",
        [dados.loteId],
      );
      if (!lote)
        throw new ErroDominio(
          "As preferências estão disponíveis antes da abertura do leilão.",
        );
      await banco.busca(
        `INSERT INTO auction_news_preferences (user_id,lot_id,whatsapp,telegram,email,whatsapp_number,telegram_username) VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (user_id,lot_id) DO UPDATE SET whatsapp=EXCLUDED.whatsapp,telegram=EXCLUDED.telegram,email=EXCLUDED.email,whatsapp_number=EXCLUDED.whatsapp_number,telegram_username=EXCLUDED.telegram_username,updated_at=now()`,
        [
          usuario.id,
          dados.loteId,
          dados.whatsapp,
          dados.telegram,
          dados.email,
          dados.numeroWhatsapp,
          dados.usuarioTelegram,
        ],
      );
    });
    return {
      whatsapp: dados.whatsapp,
      telegram: dados.telegram,
      email: dados.email,
      numeroWhatsapp: dados.numeroWhatsapp,
      usuarioTelegram: dados.usuarioTelegram,
    };
  });
}
