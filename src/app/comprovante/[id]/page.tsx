import { Receipt } from "@/features/receipts/receipt-page";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Receipt id={id} />;
}
