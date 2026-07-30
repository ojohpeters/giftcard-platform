"use client";

import { useEffect } from "react";

// Languages that should render right-to-left.
export const RTL_LANGS = new Set(["fa", "ar", "he", "ur"]);

export function applyDirection(lang: string | null) {
  if (typeof document === "undefined") return;
  const code = (lang || "en").toLowerCase();
  const isRtl = RTL_LANGS.has(code) || RTL_LANGS.has(code.split("-")[0]);
  const html = document.documentElement;
  html.lang = code;
  html.dir = isRtl ? "rtl" : "ltr";
}

/**
 * Keeps the document direction/lang in sync with the user's selected language
 * (stored under `higc_language`). This gives real RTL layout for Persian/Arabic
 * regardless of the Google Translate widget, which does not reliably flip dir.
 *
 * Listens for storage changes (other tabs) and a custom `higc-language-change`
 * event dispatched by the language switcher in the same tab.
 */
export default function DirectionManager() {
  useEffect(() => {
    applyDirection(localStorage.getItem("higc_language"));

    const onCustom = (e: Event) => applyDirection((e as CustomEvent<string>).detail);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "higc_language") applyDirection(e.newValue);
    };

    window.addEventListener("higc-language-change", onCustom as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("higc-language-change", onCustom as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return null;
}
