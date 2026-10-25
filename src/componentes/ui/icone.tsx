import { Chip } from "@heroui/react";
import { fonteIcones } from "@/lib/fonte-icones";

const simbolos = {
  som: "volume_up",
  semSom: "volume_off",
  email: "mail",
  senha: "lock",
  pessoa: "person",
  grisalho: "elderly",
  animal: "pets",
  ilustracao: "draw",
  inicio: "home",
  leilao: "gavel",
  carteira: "account_balance_wallet",
  comprovante: "receipt_long",
  sair: "logout",
  entrar: "login",
  cadastro: "person_add",
  menu: "menu",
  claro: "light_mode",
  escuro: "dark_mode",
  seta: "arrow_outward",
  voltar: "arrow_back",
  buscar: "search",
  adicionar: "add",
  fechar: "close",
  expandir: "expand_more",
  recolher: "expand_less",
  acompanhar: "picture_in_picture_alt",
  ampliar: "zoom_in",
  reduzir: "zoom_out",
  restaurar: "restart_alt",
  externo: "open_in_new",
  copiar: "content_copy",
  confirmar: "check",
  auditoria: "verified_user",
  tempo: "schedule",
  pagamento: "payments",
  imagem: "image",
  mural: "grid_view",
  informacao: "info",
  cancelar: "cancel",
  ver: "visibility",
  ocultar: "visibility_off",
  remover: "remove",
  seguranca: "shield",
  historico: "format_list_bulleted",
} as const;
export type NomeIcone = keyof typeof simbolos;

export function Icone({
  nome,
  className = "",
  titulo,
}: {
  nome: NomeIcone;
  className?: string;
  titulo?: string;
}) {
  return (
    <Chip.Label
      aria-hidden="true"
      title={titulo}
      className={`${fonteIcones.className} inline-block shrink-0 select-none text-[20px] leading-none font-normal not-italic tracking-normal normal-case whitespace-nowrap ${className}`}
    >
      {simbolos[nome]}
    </Chip.Label>
  );
}
