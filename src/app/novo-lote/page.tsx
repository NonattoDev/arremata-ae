"use client";
import { CreateLot } from "@/features/auctions/create-lot";
import { Protected } from "@/features/auth/protected";
import { useSession } from "@/components/providers/session-provider";
export default function Page() {
  const session = useSession();
  const user = session.data?.user;
  return (
    <Protected auth={session}>{user && <CreateLot user={user} />}</Protected>
  );
}
