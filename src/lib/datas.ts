import dayjs from "dayjs";
import "dayjs/locale/pt-br";

// O instante é preservado; a apresentação usa o horário local de quem está consultando.
export const dataLocal = (valor?: string | number | Date) =>
  dayjs(valor).locale("pt-br");
export const formatarDataHora = (valor: string) =>
  dataLocal(valor).format("DD/MM/YYYY, HH:mm:ss");
export const formatarData = (valor: string) =>
  dataLocal(valor).format("DD/MM/YYYY");

// O museu também informa anos e períodos aproximados: esses textos são preservados.
export function formatarDataAcervo(valor: string): string {
  const partes = /^(\d{4}-\d{2}-\d{2})(?:T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d+)?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/.exec(valor);
  if (!partes) return valor;
  const dia = dataLocal(partes[1]);
  if (!dia.isValid() || dia.format("YYYY-MM-DD") !== partes[1]) return valor;
  if (!dataLocal(valor).isValid()) return valor;
  return partes[2] === undefined ? formatarData(valor) : formatarDataHora(valor);
}
export const converterParaIso = (valor: string) => {
  const dados = dataLocal(valor);
  if (!dados.isValid()) throw new Error("Informe uma data válida.");
  return dados.toISOString();
};
