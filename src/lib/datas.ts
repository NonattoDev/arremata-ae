import dayjs from "dayjs";
import "dayjs/locale/pt-br";

// O instante é preservado; a apresentação usa o horário local de quem está consultando.
export const dataLocal = (valor?: string | number | Date) =>
  dayjs(valor).locale("pt-br");
export const formatarDataHora = (valor: string) =>
  dataLocal(valor).format("DD/MM/YYYY, HH:mm:ss");
export const formatarData = (valor: string) =>
  dataLocal(valor).format("DD/MM/YYYY");
export const converterParaIso = (valor: string) => {
  const dados = dataLocal(valor);
  if (!dados.isValid()) throw new Error("Informe uma data válida.");
  return dados.toISOString();
};
