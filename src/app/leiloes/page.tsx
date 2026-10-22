import type { Metadata } from "next";
import { Explore } from "@/features/auctions/explore";
export const metadata: Metadata = { title: "Leilões | Arremata aê" };
export default function Page() {
  return <Explore />;
}
