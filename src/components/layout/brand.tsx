import Image from "next/image";
import { Link, Typography } from "@heroui/react";

export function Brand() {
  return (
    <Link
      href="/"
      aria-label="Arremata aê, início"
      className="flex w-fit shrink-0 items-center gap-2 sm:gap-3"
    >
      <Image
        src="/brand/arremata-symbol.png"
        alt=""
        width={56}
        height={56}
        sizes="56px"
        className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
      />
      <Typography.Heading level={2}>Arremata aê</Typography.Heading>
    </Link>
  );
}
