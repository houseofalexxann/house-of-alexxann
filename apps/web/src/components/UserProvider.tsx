"use client";

/** Session-aware context: who's signed in and whether they're a member. */
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface SessionUser {
  name: string | null;
  email: string;
  isMember: boolean;
  role: string;
  /** False for the House Mother's admin key alone: full access, but no account to keep things in. */
  hasAccount?: boolean;
  /** The account holder's own saved chart. */
  profile: {
    name: string;
    birthDate: string;
    birthTime: string | null;
    placeLabel: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  } | null;
}

const Ctx = createContext<{
  user: SessionUser | null;
  loading: boolean;
  /** Live membership price in cents, set by the House Mother in the admin. */
  membershipPriceCents: number;
  /** Read the session again (after the own chart changes, for instance). */
  refresh: () => Promise<void>;
}>({
  user: null,
  loading: true,
  membershipPriceCents: 500,
  refresh: async () => {},
});

async function readSession(): Promise<{ user: SessionUser | null; membershipPriceCents?: number } | null> {
  try {
    const res = await fetch("/api/auth");
    return (await res.json()) as { user: SessionUser | null; membershipPriceCents?: number };
  } catch {
    return null;
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [membershipPriceCents, setPrice] = useState(500);
  useEffect(() => {
    let alive = true;
    void readSession().then((d) => {
      if (!alive) return;
      setUser(d?.user ?? null);
      if (typeof d?.membershipPriceCents === "number") setPrice(d.membershipPriceCents);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);
  const refresh = useCallback(async () => {
    const d = await readSession();
    // A failed read keeps what we have rather than signing the visitor out on screen.
    if (!d) return;
    setUser(d.user ?? null);
    if (typeof d.membershipPriceCents === "number") setPrice(d.membershipPriceCents);
  }, []);
  return (
    <Ctx.Provider value={{ user, loading, membershipPriceCents, refresh }}>{children}</Ctx.Provider>
  );
}

export function useUser() {
  return useContext(Ctx);
}
