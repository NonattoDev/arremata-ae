"use client";
import { MyLots } from "@/features/auctions/my-lots";
import { Protected } from "@/features/auth/protected";
import { useSession } from "@/components/providers/session-provider";
export default function Page() {
  const session = useSession();
  const user = session.data?.user;
  return <Protected auth={session}>{user && <MyLots user={user} />}</Protected>;
}
