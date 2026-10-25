export type AjusteFoto = { zoom: number; horizontal: number; vertical: number };
export const ajusteInicial: AjusteFoto = {
  zoom: 1,
  horizontal: 0,
  vertical: 0,
};

export function recortarFoto(imagem: ImageBitmap, ajuste: AjusteFoto) {
  const lado = Math.min(imagem.width, imagem.height) / ajuste.zoom;
  const x = ((imagem.width - lado) * (ajuste.horizontal + 100)) / 200;
  const y = ((imagem.height - lado) * (ajuste.vertical + 100)) / 200;
  const tela = document.createElement("canvas");
  tela.width = tela.height = 320;
  const contexto = tela.getContext("2d");
  if (!contexto)
    throw new Error("Seu navegador não conseguiu preparar a foto.");
  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, 320, 320);
  contexto.drawImage(imagem, x, y, lado, lado, 0, 0, 320, 320);
  return tela.toDataURL("image/jpeg", 0.9);
}
