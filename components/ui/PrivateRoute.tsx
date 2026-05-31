"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "../../context/StoreContext";

/**
 * Wrap any page with this to make it private.
 * Guests and unauthenticated users are redirected to the login page (/).
 */
export function PrivateRoute({ children, allowGuest = true }: { children: React.ReactNode, allowGuest?: boolean }) {
  const { user, isLoading } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/");
      } else if (user.is_guest && !allowGuest) {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router, allowGuest]);

  // While checking auth, show nothing (prevents flash)
  if (isLoading || !user || (user.is_guest && !allowGuest)) return null;

  return <>{children}</>;
}
