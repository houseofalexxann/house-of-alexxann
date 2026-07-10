"use client";

/** Session-aware context: who's signed in and whether they're a member. */
import { createContext, useContext, useEffect, useState } from "react";

export interface SessionUser {
  name: string | null;
  email: string;
  isMember: boolean;
  role: string;
}

const Ctx = createContext<{ user: SessionUser | null; loading: boolean }>({
  user: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  return <Ctx.Provider value={{ user, loading }}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}
