const nomes = [
  "Marina",
  "Rafael",
  "Clara",
  "Pedro",
  "Beatriz",
  "Lucas",
  "Helena",
  "Gabriel",
  "Isabela",
  "Daniel",
  "Sofia",
  "Felipe",
  "Laura",
  "André",
  "Camila",
  "Mateus",
];

/** Apelido de exibição estável. Não revela o nome cadastrado nem altera a auditoria. */
export function apelidoParticipante(identificador: string): string {
  const codigo = /^Participante ([a-f\d]{8})$/i.exec(identificador)?.[1];
  if (!codigo) return identificador;
  const numero = Number.parseInt(codigo, 16);
  const nome = nomes[numero % nomes.length];
  const inicial = String.fromCharCode(
    65 + (Math.floor(numero / nomes.length) % 26),
  );
  return `${nome} ${inicial}.`;
}
