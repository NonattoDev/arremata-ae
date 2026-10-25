import { Avatar } from "@heroui/react";
import { animais, enderecoAvatar } from "@/lib/avatares";

export function AvatarUsuario({
  nome,
  avatar,
  grande = false,
}: {
  nome: string;
  avatar?: string | null;
  grande?: boolean;
}) {
  const animal = animais.find((item) => item.id === avatar);
  return (
    <Avatar className={grande ? "size-20" : "size-10"}>
      {!animal && (
        <Avatar.Image src={enderecoAvatar(avatar)} alt={`Avatar de ${nome}`} />
      )}
      <Avatar.Fallback
        aria-label={animal ? `Avatar de ${nome}: ${animal.nome}` : undefined}
        className={animal ? (grande ? "text-5xl" : "text-3xl") : undefined}
      >
        {animal?.emoji || nome.slice(0, 2).toUpperCase()}
      </Avatar.Fallback>
    </Avatar>
  );
}
