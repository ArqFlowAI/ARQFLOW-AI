"use client";

import { useQuery } from "@tanstack/react-query";
import type { SessionUser } from "@/types";

export function useSession() {
  return useQuery<SessionUser | null>({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user ?? null;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
