type HistoriaObra = {
  contexto: string;
  detalhe: string;
  fonte: string;
};

// Resumos em português das fichas do museu, consultadas em 24/10/2026.
// Mantidos localmente para a leitura não depender da disponibilidade da API.
export const historiasObras: Record<string, HistoriaObra> = {
  "135382": {
    contexto:
      "Camille, a primeira esposa de Monet, aparece do lado de fora da casa do casal em Argenteuil, em um dia de neve. Vista através das portas de vidro, ela volta o olhar para dentro. O vermelho da roupa se destaca na paisagem de inverno.",
    detalhe:
      "Monet guardou esta pintura por toda a vida. O rosto de Camille, a neve e as árvores são construídos com pinceladas rápidas e cores pouco misturadas, características da técnica impressionista.",
    fonte: "https://www.clevelandart.org/art/1958.39",
  },
  "95272": {
    contexto:
      "Em 1888, Monet passou quatro meses em Antibes, no litoral mediterrâneo da França. Nesta tela, pintou a casa de um jardineiro com o mar e os Alpes ao fundo. Ventos fortes chegaram a ameaçar seu cavalete durante a viagem.",
    detalhe:
      "As camadas espessas de tinta e as cores claras traduzem a luz intensa do meio-dia. Pequenos toques de verde nas árvores sugerem a chegada da primavera.",
    fonte: "https://www.clevelandart.org/art/1916.1044",
  },
  "136510": {
    contexto:
      "O lago de nenúfares do jardim de Monet, em Giverny, foi tema recorrente nos últimos 30 anos de sua vida. O próprio artista planejou e ajudou a cultivar esse jardim. Nesta tela, ele observa a luz que atravessa e se reflete na água.",
    detalhe:
      "A composição deixa de fora o horizonte e as margens do lago. Com mais de quatro metros de largura, a pintura faz a superfície da água ocupar quase todo o campo de visão de quem a observa.",
    fonte: "https://www.clevelandart.org/art/1960.81",
  },
};
