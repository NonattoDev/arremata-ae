import { LotRoom } from "@/features/auctions/lot-room";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LotRoom id={id} />;
}
