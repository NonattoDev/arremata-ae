export const formatarReais = (centavos: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    centavos / 100,
  );

export { formatarDataHora as formatarDataHora } from "./datas";

export const rotulosSituacao: Record<string, string> = {
  live: "Ao vivo",
  scheduled: "Em breve",
  closed: "Encerrado",
  cancelled: "Cancelado",
};
