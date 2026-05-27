"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { SessionUser } from "@/types";

type AuthContextValue = {
  supabaseUser: User | null;
  appUser: SessionUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  isConfigured: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  supabaseUser: null,
  appUser: null,
  loading: true,
  refresh: async () => {},
  isConfigured: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = useMemo(() => isSupabaseConfigured(), []);
  const supabase = useMemo(() => (isConfigured ? createClient() : null), [isConfigured]);

  async function refresh() {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setSupabaseUser(user);

    if (user) {
        try {
          const res = await fetch("/api/auth/session");
          if (res.ok) {
            const data = await res.json();
            setAppUser(data.user ?? null);
          } else {
            setAppUser(null);
          }
        } catch (err) {
          console.error("[AuthProvider] refresh session failed", err);
          setAppUser(null);
        }
    } else {
      setAppUser(null);
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    refresh().finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
          fetch("/api/auth/session")
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => setAppUser(d?.user ?? null))
            .catch((err) => {
              console.error("[AuthProvider] onAuthStateChange session fetch failed", err);
              setAppUser(null);
            });
      } else {
        setAppUser(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ supabaseUser, appUser, loading, refresh, isConfigured }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
