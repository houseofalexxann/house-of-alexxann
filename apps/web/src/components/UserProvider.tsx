"use client";

/** Session-aware context: who's signed in and whether they're a member. */
import { createContext, useContext, useEffect, useState } from "react";

export interface SessionUser {
  name: string | null;
  email: string;
  isMember: boolean;
  role: string;
  profile: {
    name: string;
    birthDate: string;
    birthTime: string | null;
    placeLabel: string;
  } | null;
}

const Ctx = createContext<{
  user: SessionUser | null;
  loading: boolean;
  /** Live membership price in cents, set by the House Mother in the admin. */
  membershipPriceCents: number;
}>({
  user: null,
  loading: true,
  membershipPriceCents: 500,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [membershipPriceCents, setPrice] = useState(500);
  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        if (typeof d.membershipPriceCents === "number") setPrice(d.membershipPriceCents);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Ctx.Provider value={{ user, loading, membershipPriceCents }}>{children}</Ctx.Provider>
  );
}

export function useUser() {
  return useContext(Ctx);
}
