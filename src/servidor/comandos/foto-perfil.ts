import sharp from "sharp";
import { z } from "zod";
import { exigirUsuario, type ContextoComando } from "./contexto";
import { ErroDominio } from "../leilao";

export async function salvarFotoPerfil(
  contexto: ContextoComando,
  entrada: unknown,
) {
  const usuario = await exigirUsuario(contexto);
  const foto = z
    .string()
    .max(700_000)
    .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/)
    .parse(entrada);
  let imagem: Buffer;
  try {
    // Reprocessar evita confiar no MIME do navegador e remove EXIF da imagem enviada.
    const processamento = sharp(Buffer.from(foto.split(",")[1], "base64"), {
      limitInputPixels: 4_000_000,
    });
    const metadados = await processamento.metadata();
    if (metadados.format !== "jpeg") throw new Error("Formato inválido");
    imagem = await processamento
      .rotate()
      .resize(320, 320, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    throw new ErroDominio(
      "Não foi possível ler esta foto. Escolha outra imagem.",
    );
  }
  const avatar = `data:image/jpeg;base64,${imagem.toString("base64")}`;
  await contexto.db.busca("UPDATE users SET avatar=$1 WHERE id=$2", [
    avatar,
    usuario.id,
  ]);
  return { avatar };
}
