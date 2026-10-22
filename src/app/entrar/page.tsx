"use client";
import { Auth } from "@/features/auth/auth-form";
import { useSession } from "@/components/providers/session-provider";
export default function Page() {
  const session = useSession();
  return <Auth onLogin={session.refresh} />;
}
