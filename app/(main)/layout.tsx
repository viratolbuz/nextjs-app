"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { DateRangeProvider } from "@/contexts/DateRangeContext";

/**
 * Auth is restored from localStorage only on the client, so Redux initialState
 * differs from the server (always logged out). Until mount, render a neutral
 * shell identical on server + first client paint to avoid hydration mismatch.
 */
export default function MainLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn) router.replace("/login");
  }, [mounted, isLoggedIn, router]);

  if (!mounted) {
    return <div className="flex min-h-screen bg-background" aria-busy="true" />;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <DateRangeProvider>
      <AppLayout>{children}</AppLayout>
    </DateRangeProvider>
  );
}
