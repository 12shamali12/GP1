"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DICTIONARY, type Lang } from "./dictionary";

/* ----------------------------------------------------------------------- *
 * Storage helpers
 * ----------------------------------------------------------------------- */

const LANGUAGE_KEY = "denty-language";

const isBrowser = typeof window !== "undefined";

const readStoredLang = (): Lang => {
  if (!isBrowser) return "en";
  try {
    const raw = localStorage.getItem(LANGUAGE_KEY);
    return raw === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
};

const writeStoredLang = (lang: Lang): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    /* ignore */
  }
};

/**
 * Substitute `{key}` placeholders in a template using the given values.
 * Missing values fall back to the raw `{key}` token so problems are visible.
 */
const interpolate = (
  template: string,
  values?: Record<string, string | number>,
): string => {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const v = values[key];
    return v === undefined || v === null ? match : String(v);
  });
};

/* ----------------------------------------------------------------------- *
 * Context
 * ----------------------------------------------------------------------- */

export type Direction = "ltr" | "rtl";

export type Translator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translator;
  dir: Direction;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/* ----------------------------------------------------------------------- *
 * Provider
 * ----------------------------------------------------------------------- */

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  // SSR-safe initial value; we hydrate from localStorage in a layout effect.
  const [lang, setLangState] = useState<Lang>("en");

  // Hydrate from localStorage on mount.
  useEffect(() => {
    setLangState(readStoredLang());
  }, []);

  // Apply <html dir> + <html lang> whenever the language changes.
  useEffect(() => {
    if (!isBrowser) return;
    const root = document.documentElement;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    root.lang = lang;
  }, [lang]);

  // Listen for `storage` events so changing the language in one tab
  // updates every other open tab (and also catches direct edits from the
  // Settings panel that go via this same provider — useful as a safety
  // net when integrating with future tools).
  useEffect(() => {
    if (!isBrowser) return;
    const handler = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_KEY) return;
      const next = event.newValue === "ar" ? "ar" : "en";
      setLangState(next);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    writeStoredLang(next);
  }, []);

  const t = useCallback<Translator>(
    (key, values) => {
      const table = DICTIONARY[lang];
      const fallback = DICTIONARY.en;
      const template = table[key] ?? fallback[key] ?? key;
      return interpolate(template, values);
    },
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t,
      dir: lang === "ar" ? "rtl" : "ltr",
    }),
    [lang, setLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/* ----------------------------------------------------------------------- *
 * Hooks
 * ----------------------------------------------------------------------- */

/**
 * Full context accessor — components that need to flip the language or
 * branch on `dir` should use this. Components that only need to translate
 * strings should prefer `useTranslation`.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fall back to a no-op translator instead of throwing, so isolated
    // tests / Storybook stories of leaf components still render.
    const t: Translator = (key, values) =>
      interpolate(DICTIONARY.en[key] ?? key, values);
    return {
      lang: "en",
      setLang: () => {
        /* no-op outside provider */
      },
      t,
      dir: "ltr",
    };
  }
  return ctx;
}

/**
 * Thin wrapper used by components that only need to translate strings.
 *
 *   const t = useTranslation();
 *   <button>{t('common.save')}</button>
 */
export function useTranslation(): Translator {
  return useLanguage().t;
}
