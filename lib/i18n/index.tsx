"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { messages, Lang } from "./messages";

interface I18nCtx {
  lang: Lang;
  dir: "rtl" | "ltr";
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nCtx>({
  lang: "en", dir: "ltr", setLang: () => {}, t: (k) => k,
});

function resolve(obj: any, key: string): unknown {
  return key.split(".").reduce((o: any, k) => (o == null ? undefined : o[k]), obj);
}

// Persian-first: this is an Iranian (.ir) site, so Persian (RTL) is the default.
// Every core customer page is translated, so nothing renders as "inverted
// English". A saved English preference still wins.
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fa");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("higc_language") : null) as Lang | null;
    if (saved === "fa" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    if (typeof window !== "undefined") localStorage.setItem("higc_language", l);
    setLangState(l);
  }, []);

  const t = useCallback(
    (key: string) => {
      const v = resolve(messages[lang], key);
      if (typeof v === "string") return v;
      const fb = resolve(messages.en, key);
      return typeof fb === "string" ? fb : key;
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, dir: lang === "fa" ? "rtl" : "ltr", setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
