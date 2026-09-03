"use client";

/**
 * Client-side locale: stored in localStorage (hoa-lang), defaulting to the
 * browser language when supported. Chrome strings translate instantly;
 * long-form readings remain English in v1 (the switcher says so).
 *
 * The locale is an external store (a module variable plus localStorage) that
 * React subscribes to, so the server renders English, the client resolves
 * the real locale on hydration, and nothing has to set state inside an
 * effect.
 */
import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { DICTIONARIES, type Locale } from "./dictionaries";

const STORAGE_KEY = "hoa-lang";

let current: Locale | null = null;
const listeners = new Set<() => void>();

function resolve(): Locale {
  if (current) return current;
  let found: Locale = "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && DICTIONARIES[stored]) {
      found = stored;
    } else {
      const nav = navigator.language.slice(0, 2) as Locale;
      if (DICTIONARIES[nav]) found = nav;
    }
  } catch {
    // Private windows and locked-down browsers: English is fine.
  }
  current = found;
  return found;
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getServerSnapshot(): Locale {
  return "en";
}

function setStored(l: Locale) {
  current = l;
  try {
    window.localStorage.setItem(STORAGE_KEY, l);
  } catch {
    // Nothing to do: the choice still holds for this visit.
  }
  document.documentElement.lang = l;
  listeners.forEach((fn) => fn());
}

interface LocaleCtx {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const Ctx = createContext<LocaleCtx>({
  locale: "en",
  setLocale: () => {},
  t: (k) => DICTIONARIES.en[k] ?? k,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, resolve, getServerSnapshot);

  const setLocale = useCallback((l: Locale) => {
    if (DICTIONARIES[l]) setStored(l);
  }, []);

  const t = useCallback(
    (key: string) => DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key,
    [locale]
  );

  return <Ctx.Provider value={{ locale, setLocale, t }}>{children}</Ctx.Provider>;
}

export function useLocale(): LocaleCtx {
  return useContext(Ctx);
}
