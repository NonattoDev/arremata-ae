"use client";
import { WalletPage } from "@/features/wallet/wallet-page";
import { Protected } from "@/features/auth/protected";
import { useSession } from "@/components/providers/session-provider";
export default function Page() {
  const session = useSession();
  const user = session.data?.user;
  return (
    <Protected auth={session}>{user && <WalletPage user={user} />}</Protected>
  );
}
