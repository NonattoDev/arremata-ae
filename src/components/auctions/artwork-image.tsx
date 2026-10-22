import Image from "next/image";

/** Approved image exception: HeroUI 3 has no Image component. */
export function ArtworkImage({
  src,
  alt,
  compact = false,
}: {
  src: string;
  alt: string;
  compact?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={900}
      sizes={
        compact
          ? "(max-width: 768px) 100vw, 33vw"
          : "(max-width: 1024px) 100vw, 50vw"
      }
      className={
        compact
          ? "h-64 w-full object-contain"
          : "h-auto max-h-96 w-full object-contain"
      }
      unoptimized
    />
  );
}
