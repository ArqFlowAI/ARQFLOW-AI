"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { SessionUser } from "@/types";

type AuthContextValue = {
  supabaseUser: User | null;
  appUser: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  supabaseUser: null,
  appUser: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  async function refresh() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setSupabaseUser(user);

    if (user) {
      const res = await fetch("/api/auth/session");
      const data = await res.json();
      setAppUser(data.user ?? null);
    } else {
      setAppUser(null);
    }
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        fetch("/api/auth/session")
          .then((r) => r.json())
          .then((d) => setAppUser(d.user ?? null));
      } else {
        setAppUser(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider
      value={{ supabaseUser, appUser, loading, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
