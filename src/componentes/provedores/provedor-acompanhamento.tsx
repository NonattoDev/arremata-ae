"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSessao } from "./provedor-sessao";
import { useSomLances } from "@/hooks/use-som-lances";
import {
  adicionarAcompanhamento,
  lerAcompanhamento,
} from "@/lib/acompanhamento";

type Acompanhamento = {
  ids: string[];
  recolhido: boolean;
  pronto: boolean;
  aviso: string;
  adicionar: (id: string) => void;
  remover: (id: string) => void;
  alternar: () => void;
  limparAviso: () => void;
  som: ReturnType<typeof useSomLances>;
  silenciados: string[];
  alternarSomLote: (id: string) => void;
};
const Contexto = createContext<Acompanhamento | null>(null);

function SelecaoDaConta({
  identidade,
  children,
}: {
  identidade: string;
  children: ReactNode;
}) {
  const chave = `arremata:acompanhamento:${identidade}`;
  const [ids, definirIds] = useState<string[]>([]);
  const [recolhido, definirRecolhido] = useState(false);
  const [pronto, definirPronto] = useState(false);
  const [aviso, definirAviso] = useState("");
  const [silenciados, definirSilenciados] = useState<string[]>([]);
  const som = useSomLances(ids, silenciados);
  useEffect(() => {
    try {
      definirIds(lerAcompanhamento(localStorage.getItem(chave)));
      definirRecolhido(localStorage.getItem(`${chave}:recolhido`) === "sim");
      definirSilenciados(lerAcompanhamento(localStorage.getItem(`${chave}:silenciados`)));
    } catch {
      definirAviso(
        "O navegador não permite salvar a seleção. Ela será mantida somente nesta navegação.",
      );
    }
    definirPronto(true);
  }, [chave]);
  useEffect(() => {
    if (!pronto) return;
    try {
      // Persistimos apenas IDs. Preços, posição e prazos são sempre revalidados no servidor.
      localStorage.setItem(chave, JSON.stringify(ids));
      localStorage.setItem(`${chave}:recolhido`, recolhido ? "sim" : "não");
      localStorage.setItem(`${chave}:silenciados`, JSON.stringify(silenciados));
    } catch {
      definirAviso("Não foi possível salvar a seleção neste navegador.");
    }
  }, [chave, ids, pronto, recolhido, silenciados]);
  const adicionar = (id: string) => {
    try {
      definirIds(adicionarAcompanhamento(ids, id));
      definirRecolhido(false);
      definirAviso("");
    } catch (erro) {
      definirAviso((erro as Error).message);
    }
  };
  return (
    <Contexto.Provider
      value={{
        ids,
        recolhido,
        pronto,
        aviso,
        som,
        silenciados,
        alternarSomLote: (id) =>
          definirSilenciados((atuais) =>
            atuais.includes(id)
              ? atuais.filter((atual) => atual !== id)
              : [...atuais, id],
          ),
        adicionar,
        remover: (id) => {
          definirIds((atuais) => atuais.filter((atual) => atual !== id));
          definirSilenciados((atuais) => atuais.filter((atual) => atual !== id));
          definirAviso("");
        },
        alternar: () => definirRecolhido((valor) => !valor),
        limparAviso: () => definirAviso(""),
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function ProvedorAcompanhamento({ children }: { children: ReactNode }) {
  const sessao = useSessao();
  const identidade = sessao.dados?.user?.id ?? "visitante";
  return (
    <SelecaoDaConta key={identidade} identidade={identidade}>
      {children}
    </SelecaoDaConta>
  );
}

export function useAcompanhamento() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error("Acompanhamento fora do provedor.");
  return contexto;
}
