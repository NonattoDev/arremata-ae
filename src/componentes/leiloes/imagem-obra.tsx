import Image from "next/image";

/** Next/Image é a exceção aprovada para imagens, ausente na HeroUI 3. */
export function ImagemObra({
  src: origemImagem,
  alt: descricaoImagem,
  compacta = false,
  preencher = false,
  destaque = false,
}: {
  src: string;
  alt: string;
  compacta?: boolean;
  preencher?: boolean;
  destaque?: boolean;
}) {
  return (
    <Image
      src={origemImagem}
      alt={descricaoImagem}
      width={1200}
      height={900}
      loading={destaque ? "eager" : "lazy"}
      sizes={
        compacta
          ? "(max-width: 768px) 100vw, 33vw"
          : "(max-width: 1024px) 100vw, 50vw"
      }
      className={
        preencher
          ? "h-full w-full object-contain"
          : compacta
            ? "h-64 w-full object-contain"
            : "h-auto max-h-96 w-full object-contain"
      }
      unoptimized
    />
  );
}
