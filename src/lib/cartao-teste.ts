import identificar from "credit-card-type";
import { dataLocal as dayjs } from "@/lib/datas";
export function bandeiraCartao(numero: string) {
  const opcoes = identificar(numero.replace(/\D/g, ""));
  return opcoes.length === 1 ? opcoes[0] : undefined;
}
export function validarCartaoTeste(
  nome: string,
  numero: string,
  validade: string,
  cvv: string,
) {
  const digitos = numero.replace(/\D/g, "");
  const bandeira = bandeiraCartao(digitos);
  if (nome.trim().length < 3) return "Informe o nome do titular de teste.";
  if (!bandeira || !bandeira.lengths.includes(digitos.length))
    return "Confira o número do cartão de teste.";
  let soma = 0;
  for (
    let i = digitos.length - 1, dobrar = false;
    i >= 0;
    i--, dobrar = !dobrar
  ) {
    let valor = Number(digitos[i]);
    if (dobrar) {
      valor *= 2;
      if (valor > 9) valor -= 9;
    }
    soma += valor;
  }
  if (soma % 10 !== 0) return "Confira o número do cartão de teste.";
  const partes = /^(\d{2})\/(\d{2})$/.exec(validade);
  if (!partes || Number(partes[1]) < 1 || Number(partes[1]) > 12)
    return "Use uma validade no formato MM/AA.";
  const fim = dayjs()
    .date(1)
    .year(2000 + Number(partes[2]))
    .month(Number(partes[1]) - 1)
    .endOf("month");
  if (fim.isBefore(dayjs())) return "O cartão de teste está vencido.";
  if (!new RegExp("^\\d{" + bandeira.code.size + "}$").test(cvv))
    return "Confira o código de segurança de teste.";
  return "";
}
