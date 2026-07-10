"use client";

/**
 * Client-side locale: stored in localStorage (hoa-lang), defaulting to the
 * browser language when supported. Chrome strings translate instantly;
 * long-form readings remain English in v1 (the switcher says so).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { DICTIONARIES, type Locale } from "./dictionaries";

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
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("hoa-lang") as Locale | null;
    if (stored && DICTIONARIES[stored]) {
      setLocaleState(stored);
      return;
    }
    const nav = navigator.language.slice(0, 2) as Locale;
    if (DICTIONARIES[nav]) setLocaleState(nav);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem("hoa-lang", l);
    document.documentElement.lang = l;
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
