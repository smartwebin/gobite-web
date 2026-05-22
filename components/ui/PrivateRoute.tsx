"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "../../context/StoreContext";

/**
 * Wrap any page with this to make it private.
 * Guests and unauthenticated users are redirected to the login page (/).
 */
export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.is_guest)) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // While checking auth, show nothing (prevents flash)
  if (isLoading || !user || user.is_guest) return null;

  return <>{children}</>;
}
