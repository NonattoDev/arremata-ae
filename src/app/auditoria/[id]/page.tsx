import { Audit } from "@/features/audit/audit-page";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Audit id={id} />;
}
