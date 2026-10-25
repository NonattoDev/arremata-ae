export const animais = [
  { id: "animal-gato", nome: "Gato", emoji: "🐱" },
  { id: "animal-cachorro", nome: "Cachorro", emoji: "🐶" },
  { id: "animal-raposa", nome: "Raposa", emoji: "🦊" },
  { id: "animal-panda", nome: "Panda", emoji: "🐼" },
  { id: "animal-leao", nome: "Leão", emoji: "🦁" },
  { id: "animal-coelho", nome: "Coelho", emoji: "🐰" },
  { id: "animal-coruja", nome: "Coruja", emoji: "🦉" },
  { id: "animal-sapo", nome: "Sapo", emoji: "🐸" },
];
export const categoriasAvatares = [
  {
    id: "pessoas",
    nome: "Pessoas",
    itens: Array.from({ length: 8 }, (_, i) => ({
      id: `pessoa-${i + 1}`,
      nome: `Pessoa ${i + 1}`,
    })),
  },
  {
    id: "grisalhos",
    nome: "Grisalhos",
    itens: Array.from({ length: 4 }, (_, i) => ({
      id: `pessoa-${i + 9}`,
      nome: `Pessoa grisalha ${i + 1}`,
    })),
  },
  { id: "animais", nome: "Animais", itens: animais },
  {
    id: "ilustrados",
    nome: "Traços",
    itens: Array.from({ length: 12 }, (_, i) => ({
      id: `avatar-${i + 1}`,
      nome: `Ilustração ${i + 1}`,
    })),
  },
];
export const avatares = categoriasAvatares.flatMap((categoria) =>
  categoria.itens.map((item) => item.id),
);

export function enderecoAvatar(avatar?: string | null) {
  if (avatar?.startsWith("data:image/jpeg;base64,")) return avatar;
  return `/avatares/${avatar && avatares.includes(avatar) ? avatar : "avatar-1"}.svg`;
}
