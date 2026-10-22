export const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

export const date = (value: string) => new Date(value).toLocaleString("pt-BR");

export const labels: Record<string, string> = {
  live: "Ao vivo",
  scheduled: "Em breve",
  closed: "Encerrado",
  cancelled: "Cancelado",
};
